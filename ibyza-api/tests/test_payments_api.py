"""
Tests de API para la app payments (separaciones + Culqi).

Capa: API/Service + Unit (serializer validations)
Tecnicas ISTQB aplicadas:
  - Particion de equivalencia (depto disponible/no disponible, pago ok/error)
  - Analisis de valores limite (monto 0, monto negativo, DNI 7/8/9 digitos)
  - Transicion de estados (pendiente -> completado / fallido)
  - Error guessing (token vacio, depto ya separado, excepcion Culqi)
"""
from decimal import Decimal
from unittest.mock import patch, MagicMock
from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status
from payments.models import Separacion
from projects.models import Departamento
from tests.conftest import BaseTestData


@override_settings(
    CULQI_SECRET_KEY='sk_test_fake_key',
    CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
)
class SeparacionAPITest(BaseTestData, TestCase):
    """Tests para POST /api/pagos/separacion/"""

    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.url = '/api/pagos/separacion/'
        self.proyecto = self.crear_proyecto()
        self.nivel = self.crear_nivel(self.proyecto)
        self.departamento = self.crear_departamento(self.nivel, codigo='101')

    # ── Pago exitoso (mock Culqi) ────────────────────────────────────────

    @patch('payments.views.culqipy')
    def test_separacion_exitosa(self, mock_culqipy):
        mock_culqipy.Charge.create.return_value = {
            'object': 'charge',
            'id': 'chr_test_123456',
        }

        data = self.datos_separacion(self.departamento.pk)
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['estado'], 'completado')
        self.assertIn('id', response.data)

        # Verificar que el departamento se marco como separado
        self.departamento.refresh_from_db()
        self.assertEqual(self.departamento.estado, 'separado')

        # Verificar la separacion en BD
        sep = Separacion.objects.get(pk=response.data['id'])
        self.assertEqual(sep.culqi_charge_id, 'chr_test_123456')
        self.assertEqual(sep.estado, 'completado')
        self.assertEqual(sep.nombre, 'Carlos')

    @patch('payments.views.culqipy')
    def test_separacion_exitosa_envia_monto_correcto_a_culqi(self, mock_culqipy):
        """Culqi espera el monto en centimos (centavos). S/ 1000.00 = 100000."""
        mock_culqipy.Charge.create.return_value = {
            'object': 'charge',
            'id': 'chr_test_999',
        }

        data = self.datos_separacion(self.departamento.pk, monto='1500.50')
        self.client.post(self.url, data, format='json')

        call_args = mock_culqipy.Charge.create.call_args[0][0]
        self.assertEqual(call_args['amount'], 150050)
        self.assertEqual(call_args['currency_code'], 'PEN')

    # ── Pago rechazado por Culqi ─────────────────────────────────────────

    @patch('payments.views.culqipy')
    def test_pago_rechazado_por_culqi(self, mock_culqipy):
        mock_culqipy.Charge.create.return_value = {
            'object': 'error',
            'user_message': 'Tarjeta rechazada',
        }

        data = self.datos_separacion(self.departamento.pk)
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_402_PAYMENT_REQUIRED)
        self.assertIn('Tarjeta rechazada', response.data['detail'])

        # Departamento debe seguir disponible
        self.departamento.refresh_from_db()
        self.assertEqual(self.departamento.estado, 'disponible')

        # Separacion marcada como fallida
        sep = Separacion.objects.first()
        self.assertEqual(sep.estado, 'fallido')
        self.assertIn('Tarjeta rechazada', sep.error)

    # ── Excepcion de Culqi ───────────────────────────────────────────────

    @patch('payments.views.culqipy')
    def test_excepcion_culqi_retorna_500(self, mock_culqipy):
        mock_culqipy.Charge.create.side_effect = Exception('Connection timeout')

        data = self.datos_separacion(self.departamento.pk)
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Departamento debe seguir disponible
        self.departamento.refresh_from_db()
        self.assertEqual(self.departamento.estado, 'disponible')

        # Separacion marcada como fallida con el error
        sep = Separacion.objects.first()
        self.assertEqual(sep.estado, 'fallido')
        self.assertIn('Connection timeout', sep.error)

    # ── Departamento no disponible ───────────────────────────────────────

    def test_departamento_ya_separado_rechazado(self):
        self.departamento.estado = 'separado'
        self.departamento.save()

        data = self.datos_separacion(self.departamento.pk)
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Separacion.objects.count(), 0)

    def test_departamento_ya_vendido_rechazado(self):
        self.departamento.estado = 'vendido'
        self.departamento.save()

        data = self.datos_separacion(self.departamento.pk)
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Separacion.objects.count(), 0)

    def test_departamento_inexistente_rechazado(self):
        data = self.datos_separacion(99999)
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ── Validaciones del serializer ──────────────────────────────────────

    def test_dni_con_menos_de_8_digitos_rechazado(self):
        data = self.datos_separacion(self.departamento.pk, dni='1234567')
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('dni', response.data)

    def test_dni_con_9_digitos_rechazado(self):
        data = self.datos_separacion(self.departamento.pk, dni='123456789')
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('dni', response.data)

    def test_dni_con_letras_rechazado(self):
        data = self.datos_separacion(self.departamento.pk, dni='1234ABCD')
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('dni', response.data)

    def test_dni_valido_8_digitos(self):
        """DNI peruano valido: exactamente 8 digitos."""
        # Este test solo valida que pase la validacion del serializer,
        # el pago Culqi se mockea mas arriba
        data = self.datos_separacion(self.departamento.pk, dni='12345678')
        # No se llega a Culqi, solo validamos serializer
        # (ver test_separacion_exitosa para flujo completo)
        from payments.serializers import SeparacionSerializer
        serializer = SeparacionSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_monto_cero_rechazado(self):
        data = self.datos_separacion(self.departamento.pk, monto='0.00')
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('monto', response.data)

    def test_monto_negativo_rechazado(self):
        data = self.datos_separacion(self.departamento.pk, monto='-100.00')
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('monto', response.data)

    def test_culqi_token_vacio_rechazado(self):
        data = self.datos_separacion(self.departamento.pk, culqi_token='')
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_culqi_token_solo_espacios_rechazado(self):
        data = self.datos_separacion(self.departamento.pk, culqi_token='   ')
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_email_invalido_rechazado(self):
        data = self.datos_separacion(self.departamento.pk, email='no-email')
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_telefono_invalido_rechazado(self):
        data = self.datos_separacion(self.departamento.pk, telefono='abc')
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('telefono', response.data)

    # ── Campos faltantes ─────────────────────────────────────────────────

    def test_sin_culqi_token_rechazado(self):
        data = self.datos_separacion(self.departamento.pk)
        del data['culqi_token']
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_sin_departamento_rechazado(self):
        data = self.datos_separacion(self.departamento.pk)
        del data['departamento']
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ── Solo POST permitido ──────────────────────────────────────────────

    def test_get_no_permitido(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


@override_settings(
    CULQI_SECRET_KEY='sk_test_fake_key',
    CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
)
class SeparacionRaceConditionTest(BaseTestData, TestCase):
    """
    Tests para verificar proteccion contra race conditions.

    Escenario: dos usuarios intentan separar el mismo departamento
    simultaneamente. Solo uno debe tener exito.
    """

    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.url = '/api/pagos/separacion/'
        self.proyecto = self.crear_proyecto()
        self.nivel = self.crear_nivel(self.proyecto)
        self.departamento = self.crear_departamento(self.nivel, codigo='RC-01')

    @patch('payments.views.culqipy')
    def test_segunda_separacion_rechazada_si_depto_ya_no_disponible(self, mock_culqipy):
        """Simula race condition: el primer pago se completa, el segundo debe fallar."""
        mock_culqipy.Charge.create.return_value = {
            'object': 'charge',
            'id': 'chr_first',
        }

        # Primer pago exitoso
        data1 = self.datos_separacion(self.departamento.pk, nombre='Primero')
        response1 = self.client.post(self.url, data1, format='json')
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)

        # Segundo intento con el mismo departamento (ya esta 'separado')
        data2 = self.datos_separacion(self.departamento.pk, nombre='Segundo')
        response2 = self.client.post(self.url, data2, format='json')
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)

        # Solo debe haber una separacion completada
        self.assertEqual(Separacion.objects.filter(estado='completado').count(), 1)

    @patch('payments.views.culqipy')
    def test_pago_fallido_no_bloquea_departamento(self, mock_culqipy):
        """Si el pago falla, el departamento debe seguir disponible para otro comprador."""
        # Primer intento falla
        mock_culqipy.Charge.create.return_value = {
            'object': 'error',
            'user_message': 'Fondos insuficientes',
        }
        data1 = self.datos_separacion(self.departamento.pk, nombre='Fallido')
        response1 = self.client.post(self.url, data1, format='json')
        self.assertEqual(response1.status_code, status.HTTP_402_PAYMENT_REQUIRED)

        # Departamento sigue disponible
        self.departamento.refresh_from_db()
        self.assertEqual(self.departamento.estado, 'disponible')

        # Segundo intento con exito
        mock_culqipy.Charge.create.return_value = {
            'object': 'charge',
            'id': 'chr_success',
        }
        data2 = self.datos_separacion(self.departamento.pk, nombre='Exitoso')
        response2 = self.client.post(self.url, data2, format='json')
        self.assertEqual(response2.status_code, status.HTTP_201_CREATED)


class SeparacionModelTest(BaseTestData, TestCase):
    """Tests unitarios para el modelo Separacion."""

    def setUp(self):
        self.proyecto = self.crear_proyecto()
        self.nivel = self.crear_nivel(self.proyecto)
        self.departamento = self.crear_departamento(self.nivel)

    def test_crear_separacion(self):
        sep = Separacion.objects.create(
            departamento=self.departamento,
            nombre='Carlos',
            apellido='Garcia',
            email='carlos@test.com',
            telefono='998877665',
            dni='12345678',
            monto=Decimal('1000.00'),
            estado='pendiente',
        )
        self.assertEqual(sep.estado, 'pendiente')
        self.assertEqual(sep.departamento, self.departamento)

    def test_str_incluye_nombre_depto_y_estado(self):
        sep = Separacion.objects.create(
            departamento=self.departamento,
            nombre='Ana',
            apellido='Ruiz',
            email='ana@test.com',
            telefono='999888777',
            dni='87654321',
            monto=Decimal('500.00'),
            estado='completado',
        )
        s = str(sep)
        self.assertIn('Ana', s)
        self.assertIn('Ruiz', s)
        # Usar get_estado_display() para robustez ante cambios de etiquetas
        self.assertIn(sep.get_estado_display(), s)

    def test_on_delete_protect(self):
        """No se puede eliminar un departamento que tiene separaciones."""
        Separacion.objects.create(
            departamento=self.departamento,
            nombre='Test',
            apellido='Test',
            email='t@t.com',
            telefono='999999999',
            dni='11111111',
            monto=Decimal('100.00'),
        )
        from django.db.models import ProtectedError
        with self.assertRaises(ProtectedError):
            self.departamento.delete()

    def test_ordering_por_fecha_desc(self):
        sep1 = Separacion.objects.create(
            departamento=self.departamento,
            nombre='A', apellido='A', email='a@t.com',
            telefono='111111111', dni='11111111', monto=Decimal('100'),
        )
        sep2 = Separacion.objects.create(
            departamento=self.departamento,
            nombre='B', apellido='B', email='b@t.com',
            telefono='222222222', dni='22222222', monto=Decimal('200'),
        )
        separaciones = list(Separacion.objects.all())
        # El mas reciente (sep2) debe estar primero
        self.assertEqual(separaciones[0].pk, sep2.pk)
