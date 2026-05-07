import logging
from datetime import datetime, time
from urllib.parse import quote as obj_quote

from django.utils import timezone, formats, translation

from rest_framework import generics, status as http_status
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from .email_service import _render_email_html, send_notification
from .models import SolicitudContacto, SolicitudCita
from .serializers import SolicitudContactoSerializer, SolicitudCitaSerializer

logger = logging.getLogger(__name__)


# Slots fijos del negocio para citas virtuales: 12:00 PM y 4:00 PM
SLOTS_VIRTUAL = [time(12, 0), time(16, 0)]

# Compat retro: alias del nombre anterior (apunta al set virtual por defecto)
HORAS_SLOTS = SLOTS_VIRTUAL


def _slots_presencial(weekday):
    """Devuelve los slots presenciales segun el dia de la semana.

    L-V (0-4): 9:00-13:00 y 14:00-18:00 cada 30 min => 16 slots
    Sab (5):   9:00-13:00 cada 30 min               => 8 slots
    Dom (6):   cerrado                              => 0 slots
    """
    if weekday == 6:
        return []
    if weekday == 5:
        rangos = [(9, 13)]
    else:
        rangos = [(9, 13), (14, 18)]
    out = []
    for ini, fin in rangos:
        h = ini
        while h < fin:
            out.append(time(h, 0))
            out.append(time(h, 30))
            h += 1
    return out


class ContactFormThrottle(AnonRateThrottle):
    """Limita formularios de contacto a 5 por minuto por IP."""
    rate = '5/min'


# Alias retrocompatible para tests que hacen patch('contact.views._send_notification')
_send_notification = send_notification


class SolicitudContactoView(generics.CreateAPIView):
    serializer_class = SolicitudContactoSerializer
    throttle_classes = [ContactFormThrottle]

    def perform_create(self, serializer):
        obj = serializer.save()
        try:
            subject = f'[IBYZA] Nueva consulta de {obj.nombre} {obj.apellido}'

            text_body = (
                f'Nueva consulta recibida desde el sitio web.\n\n'
                f'Nombre: {obj.nombre} {obj.apellido}\n'
                f'Email: {obj.email}\n'
                f'Telefono: {obj.telefono}\n'
                f'Proyecto: {obj.proyecto_interes or "No especificado"}\n'
                f'Recibido: {obj.recibido_en.strftime("%d/%m/%Y %H:%M")}\n\n'
                f'Mensaje:\n{obj.mensaje}'
            )

            filas = [
                ('Nombre', f'{obj.nombre} {obj.apellido}'),
                ('Email', f'<a href="mailto:{obj.email}" style="color:#D6B370;text-decoration:none">{obj.email}</a>'),
                ('Telefono', f'<a href="tel:{obj.telefono}" style="color:#D6B370;text-decoration:none">{obj.telefono}</a>'),
                ('Proyecto de interes', obj.proyecto_interes or '—'),
                ('Fecha', obj.recibido_en.strftime('%d/%m/%Y %H:%M')),
                ('Mensaje', obj.mensaje.replace('\n', '<br>')),
            ]
            html_body = _render_email_html(
                titulo='Nueva consulta de contacto',
                subtitulo='Un visitante envio el formulario de contacto',
                filas=filas,
            )
            _send_notification(subject, html_body, text_body)
        except Exception:
            logger.exception('Error enviando notificacion de contacto para %s', obj.pk)


class SolicitudCitaView(generics.CreateAPIView):
    serializer_class = SolicitudCitaSerializer
    throttle_classes = [ContactFormThrottle]

    def perform_create(self, serializer):
        obj = serializer.save()
        try:
            subject = f'[IBYZA] Nueva cita - {obj.get_tipo_display()}'

            text_body = (
                f'Nueva cita solicitada desde el sitio web.\n\n'
                f'Nombre: {obj.nombre} {obj.apellido}\n'
                f'Email: {obj.email}\n'
                f'Telefono: {obj.telefono}\n'
                f'Tipo: {obj.get_tipo_display()}\n'
                f'Fecha preferida: {obj.fecha_preferida.strftime("%d/%m/%Y %H:%M")}\n\n'
                f'Mensaje: {obj.mensaje or "Sin mensaje"}'
            )

            filas = [
                ('Nombre', f'{obj.nombre} {obj.apellido}'),
                ('Email', f'<a href="mailto:{obj.email}" style="color:#D6B370;text-decoration:none">{obj.email}</a>'),
                ('Telefono', f'<a href="tel:{obj.telefono}" style="color:#D6B370;text-decoration:none">{obj.telefono}</a>'),
                ('Tipo de cita', obj.get_tipo_display()),
                ('Fecha preferida', obj.fecha_preferida.strftime('%d/%m/%Y %H:%M')),
                ('Mensaje', (obj.mensaje or '—').replace('\n', '<br>')),
            ]
            html_body = _render_email_html(
                titulo='Nueva cita solicitada',
                subtitulo='Un visitante agendo una visita',
                filas=filas,
            )
            _send_notification(subject, html_body, text_body)
        except Exception:
            logger.exception('Error enviando notificacion de cita para %s', obj.pk)

        # Confirmacion al solicitante con .ics adjunto
        try:
            from .ics import generar_ics_cita
            from content.models import ConfiguracionSitio
            import base64

            ics_content = generar_ics_cita(obj)
            config = ConfiguracionSitio.get_solo()
            direccion_maps = (
                f'https://www.google.com/maps/search/?api=1&query={obj_quote(config.direccion)}'
                if config.direccion else ''
            )

            # Locale espanol para nombres de mes/dia ("sabado 10 de mayo de 2026")
            with translation.override('es'):
                fecha_amigable = formats.date_format(
                    obj.fecha_preferida, r'l j \d\e F \d\e Y, H:i'
                )

            asunto_cliente = (
                f'[IBYZA] Cita {obj.fecha_preferida.strftime("%d/%m/%Y")} - '
                f'{obj.fecha_preferida.strftime("%H:%M")}'
            )

            filas_cliente = [
                ('Día y hora', fecha_amigable),
                ('Tipo', obj.get_tipo_display()),
                ('Dirección', config.direccion or '—'),
            ]
            if direccion_maps:
                filas_cliente.append(('Cómo llegar', f'<a href="{direccion_maps}">Ver en Google Maps</a>'))
            if obj.tipo == 'virtual' and config.meet_link_permanente:
                filas_cliente.append((
                    'Reunión Meet',
                    f'<a href="{config.meet_link_permanente}">{config.meet_link_permanente}</a>',
                ))

            html_cliente = _render_email_html(
                titulo='Tu cita fue solicitada',
                subtitulo='Te confirmaremos por correo en breve.',
                filas=filas_cliente,
            )
            text_cliente = (
                f'Hola {obj.nombre},\n\n'
                f'Recibimos tu solicitud de cita.\n'
                f'Día y hora: {fecha_amigable}\n'
                f'Tipo: {obj.get_tipo_display()}\n'
                f'Dirección: {config.direccion or "—"}\n'
            )
            if obj.tipo == 'virtual' and config.meet_link_permanente:
                text_cliente += f'Reunión Meet: {config.meet_link_permanente}\n'
            text_cliente += '\nTe confirmaremos por correo en breve.\nEquipo IBYZA'

            ics_b64 = base64.b64encode(ics_content.encode('utf-8')).decode('utf-8')

            _send_notification(
                asunto_cliente, html_cliente, text_cliente,
                recipients=[obj.email],
                attachments=[{
                    'filename': 'cita-ibyza.ics',
                    'content': ics_b64,
                }],
            )
        except Exception:
            logger.exception('Error enviando confirmacion de cita al solicitante %s', obj.pk)


class DisponibilidadCitaThrottle(AnonRateThrottle):
    """Throttle para evitar scraping del calendario (no datos sensibles, pero igual moderado)."""
    rate = '60/min'


class DisponibilidadCitasView(APIView):
    """
    GET /api/contacto/disponibilidad/?fecha=YYYY-MM-DD&tipo=presencial|virtual

    Devuelve los slots disponibles del dia segun el tipo de cita y si esta lleno.
    Una cita ocupa un slot si su estado es 'pendiente' o 'confirmada'.

    - tipo=virtual (default): [12:00, 16:00]
    - tipo=presencial: cada 30 min, L-V 9-13 y 14-18 / Sab 9-13 / Dom cerrado
    """
    permission_classes = []
    throttle_classes = [DisponibilidadCitaThrottle]

    def get(self, request):
        fecha_str = request.query_params.get('fecha')
        if not fecha_str:
            return Response(
                {'detail': 'Se requiere el parámetro "fecha" en formato YYYY-MM-DD.'},
                status=http_status.HTTP_400_BAD_REQUEST,
            )
        try:
            fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'detail': 'Formato inválido. Use YYYY-MM-DD.'},
                status=http_status.HTTP_400_BAD_REQUEST,
            )

        # Tipo de cita: por defecto 'virtual' (compat back con el endpoint anterior)
        tipo = request.query_params.get('tipo', 'virtual')
        if tipo not in ('presencial', 'virtual'):
            tipo = 'virtual'

        if tipo == 'presencial':
            horas_slots = _slots_presencial(fecha.weekday())
        else:
            horas_slots = SLOTS_VIRTUAL

        # Caso: dia sin slots (ej. domingo presencial) => lleno y vacio
        if not horas_slots:
            return Response({
                'fecha': fecha.isoformat(),
                'slots': [],
                'dia_completo_lleno': True,
            })

        ocupadas = SolicitudCita.objects.filter(
            fecha_preferida__date=fecha,
            estado__in=['pendiente', 'confirmada'],
        ).values_list('fecha_preferida', flat=True)

        # Convertir a tz local antes de extraer la hora (USE_TZ=True almacena en UTC)
        ocupadas_horas = set()
        for dt in ocupadas:
            local_dt = timezone.localtime(dt) if timezone.is_aware(dt) else dt
            ocupadas_horas.add(local_dt.time().replace(second=0, microsecond=0))

        slots = [
            {
                'hora': h.strftime('%H:%M'),
                'ocupado': h in ocupadas_horas,
            }
            for h in horas_slots
        ]
        dia_completo_lleno = all(s['ocupado'] for s in slots)

        return Response({
            'fecha': fecha.isoformat(),
            'slots': slots,
            'dia_completo_lleno': dia_completo_lleno,
        })
