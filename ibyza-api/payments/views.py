import logging
from decimal import Decimal, ROUND_HALF_UP

import culqipy
from django.conf import settings
from django.db import transaction
from rest_framework import status
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from projects.models import Departamento
from .models import Separacion
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import SeparacionSerializer, SeparacionTransferenciaSerializer


class PaymentThrottle(AnonRateThrottle):
    """Limita pagos a 10 por minuto por IP para prevenir abuso."""
    rate = '10/min'

logger = logging.getLogger(__name__)


class SeparacionView(APIView):
    """
    POST /api/pagos/separacion/
    Recibe los datos del comprador + token Culqi del frontend.
    Procesa el pago y marca el departamento como 'separado'.
    """
    throttle_classes = [PaymentThrottle]

    def post(self, request):
        serializer = SeparacionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        departamento = data['departamento']
        culqi_token = data.pop('culqi_token')

        # FIX: SELECT FOR UPDATE para prevenir race condition
        # Dos usuarios comprando el mismo depto al mismo tiempo
        with transaction.atomic():
            departamento = (
                Departamento.objects
                .select_for_update()
                .get(pk=departamento.pk)
            )

            # Re-validar disponibilidad dentro de la transaccion con lock
            if departamento.estado != 'disponible':
                return Response(
                    {'detail': 'Este departamento ya no esta disponible.'},
                    status=status.HTTP_409_CONFLICT,
                )

            separacion = Separacion.objects.create(
                departamento=departamento,
                nombre=data['nombre'],
                apellido=data['apellido'],
                email=data['email'],
                telefono=data['telefono'],
                dni=data['dni'],
                monto=data['monto'],
                estado='pendiente',
            )
            try:
                culqipy.secret_key = settings.CULQI_SECRET_KEY
                # Conversion a centimos con precision Decimal (evita errores de float)
                monto_centimos = int((data['monto'] * Decimal('100')).quantize(Decimal('1'), rounding=ROUND_HALF_UP))
                cargo = culqipy.Charge.create({
                    'amount': monto_centimos,
                    'currency_code': 'PEN',
                    'email': data['email'],
                    'source_id': culqi_token,
                    'description': f'Separacion {departamento.codigo} - IBYZA',
                })

                if cargo.get('object') == 'error':
                    separacion.estado = 'fallido'
                    separacion.error = cargo.get('user_message', 'Error en el pago')
                    separacion.save()
                    return Response(
                        {'detail': cargo.get('user_message', 'El pago no pudo procesarse.')},
                        status=status.HTTP_402_PAYMENT_REQUIRED,
                    )

                separacion.culqi_charge_id = cargo.get('id', '')
                separacion.estado = 'completado'
                separacion.save()
                departamento.estado = 'separado'
                departamento.save(update_fields=['estado'])

            except Exception as e:
                logger.exception('Error procesando pago Culqi para depto %s', departamento.codigo)
                separacion.estado = 'fallido'
                separacion.error = str(e)
                separacion.save()
                return Response(
                    {'detail': 'Error al procesar el pago. Intente nuevamente.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        return Response({
            'mensaje': 'Separacion exitosa! Nos contactaremos contigo pronto.',
            'id': separacion.id,
            'estado': separacion.estado,
        }, status=status.HTTP_201_CREATED)


class SeparacionTransferenciaView(APIView):
    """
    POST /api/pagos/separacion-transferencia/
    Recibe datos del comprador + comprobante de transferencia (multipart).
    El estado queda como 'pendiente' hasta aprobacion manual del admin.
    """
    throttle_classes = [PaymentThrottle]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = SeparacionTransferenciaSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        departamento = data['departamento']

        with transaction.atomic():
            departamento = (
                Departamento.objects
                .select_for_update()
                .get(pk=departamento.pk)
            )

            if departamento.estado != 'disponible':
                return Response(
                    {'detail': 'Este departamento ya no esta disponible.'},
                    status=status.HTTP_409_CONFLICT,
                )

            separacion = Separacion.objects.create(
                departamento=departamento,
                nombre=data['nombre'],
                apellido=data['apellido'],
                email=data['email'],
                telefono=data['telefono'],
                dni=data['dni'],
                monto=data['monto'],
                metodo_pago='transferencia',
                comprobante=data['comprobante'],
                estado='pendiente',
            )

        logger.info(
            'Separacion por transferencia registrada: depto %s, separacion #%d',
            departamento.codigo, separacion.id,
        )

        return Response({
            'mensaje': (
                'Comprobante recibido. Tu separacion queda pendiente de verificacion. '
                'Te notificaremos por correo cuando sea aprobada.'
            ),
            'id': separacion.id,
            'estado': separacion.estado,
        }, status=status.HTTP_201_CREATED)
