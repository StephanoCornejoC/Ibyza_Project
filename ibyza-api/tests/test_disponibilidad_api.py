"""
Tests para el endpoint GET /api/contacto/disponibilidad/?fecha=YYYY-MM-DD

Capa: API
Tecnicas ISTQB:
  - Particion de equivalencia (fecha valida/invalida/faltante)
  - Analisis de valores limite (0/1/2 slots ocupados)
"""
from datetime import datetime, time

from django.core.cache import cache
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status

from contact.models import SolicitudCita


@override_settings(
    CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
)
class DisponibilidadCitasAPITest(TestCase):
    """Tests para GET /api/contacto/disponibilidad/"""

    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.url = '/api/contacto/disponibilidad/'

    def _crear_cita_en_slot(self, fecha, hora, estado='pendiente'):
        """Crea una SolicitudCita ocupando un slot del dia."""
        tz = timezone.get_current_timezone()
        dt = timezone.make_aware(
            datetime.combine(fecha, hora),
            tz,
        ) if timezone.is_naive(datetime.combine(fecha, hora)) else datetime.combine(fecha, hora)
        return SolicitudCita.objects.create(
            nombre='Test',
            apellido='User',
            email='test@test.com',
            telefono='999999999',
            tipo='presencial',
            fecha_preferida=dt,
            estado=estado,
        )

    # Caso: dia sin citas
    def test_dia_libre_devuelve_ambos_slots_libres(self):
        response = self.client.get(self.url, {'fecha': '2030-01-15'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['fecha'], '2030-01-15')
        self.assertFalse(data['dia_completo_lleno'])
        self.assertEqual(len(data['slots']), 2)
        self.assertFalse(data['slots'][0]['ocupado'])
        self.assertFalse(data['slots'][1]['ocupado'])
        # Debe contener las horas 12:00 y 16:00
        horas = {s['hora'] for s in data['slots']}
        self.assertEqual(horas, {'12:00', '16:00'})

    # Caso: 1 slot ocupado
    def test_dia_con_un_slot_ocupado(self):
        fecha = datetime(2030, 1, 16).date()
        self._crear_cita_en_slot(fecha, time(12, 0), estado='pendiente')

        response = self.client.get(self.url, {'fecha': '2030-01-16'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertFalse(data['dia_completo_lleno'])
        slot_12 = next(s for s in data['slots'] if s['hora'] == '12:00')
        slot_16 = next(s for s in data['slots'] if s['hora'] == '16:00')
        self.assertTrue(slot_12['ocupado'])
        self.assertFalse(slot_16['ocupado'])

    # Caso: dia lleno
    def test_dia_completo_lleno(self):
        fecha = datetime(2030, 1, 17).date()
        self._crear_cita_en_slot(fecha, time(12, 0), estado='pendiente')
        self._crear_cita_en_slot(fecha, time(16, 0), estado='confirmada')

        response = self.client.get(self.url, {'fecha': '2030-01-17'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['dia_completo_lleno'])
        for slot in data['slots']:
            self.assertTrue(slot['ocupado'])

    # Caso: cita cancelada NO ocupa slot
    def test_cita_cancelada_no_ocupa_slot(self):
        fecha = datetime(2030, 1, 18).date()
        self._crear_cita_en_slot(fecha, time(12, 0), estado='cancelada')

        response = self.client.get(self.url, {'fecha': '2030-01-18'})
        data = response.json()
        slot_12 = next(s for s in data['slots'] if s['hora'] == '12:00')
        self.assertFalse(slot_12['ocupado'])

    # Caso: fecha invalida
    def test_fecha_formato_invalido_devuelve_400(self):
        response = self.client.get(self.url, {'fecha': '15/01/2030'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)

    def test_fecha_inexistente_devuelve_400(self):
        response = self.client.get(self.url, {'fecha': '2030-13-45'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # Caso: fecha faltante
    def test_fecha_faltante_devuelve_400(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)

    # === Tests por tipo de cita (presencial / virtual) ===

    def test_presencial_lunes_devuelve_16_slots(self):
        # 2030-01-14 es lunes (weekday=0)
        response = self.client.get(
            self.url, {'fecha': '2030-01-14', 'tipo': 'presencial'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data['slots']), 16)
        horas = [s['hora'] for s in data['slots']]
        # Manana: 9:00, 9:30, 10:00, 10:30, 11:00, 11:30, 12:00, 12:30
        # Tarde:  14:00, 14:30, 15:00, 15:30, 16:00, 16:30, 17:00, 17:30
        esperadas = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
            '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
        ]
        self.assertEqual(horas, esperadas)
        self.assertFalse(data['dia_completo_lleno'])

    def test_presencial_sabado_devuelve_8_slots(self):
        # 2030-01-19 es sabado (weekday=5)
        response = self.client.get(
            self.url, {'fecha': '2030-01-19', 'tipo': 'presencial'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data['slots']), 8)
        horas = [s['hora'] for s in data['slots']]
        esperadas = [
            '09:00', '09:30', '10:00', '10:30',
            '11:00', '11:30', '12:00', '12:30',
        ]
        self.assertEqual(horas, esperadas)

    def test_presencial_domingo_devuelve_dia_lleno(self):
        # 2030-01-20 es domingo (weekday=6) => cerrado
        response = self.client.get(
            self.url, {'fecha': '2030-01-20', 'tipo': 'presencial'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['slots'], [])
        self.assertTrue(data['dia_completo_lleno'])

    def test_virtual_devuelve_solo_dos_slots(self):
        response = self.client.get(
            self.url, {'fecha': '2030-01-14', 'tipo': 'virtual'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data['slots']), 2)
        horas = {s['hora'] for s in data['slots']}
        self.assertEqual(horas, {'12:00', '16:00'})

    def test_default_sin_tipo_es_virtual(self):
        # Compat back: sin parametro tipo => devuelve los slots virtuales
        response = self.client.get(self.url, {'fecha': '2030-01-14'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data['slots']), 2)
        horas = {s['hora'] for s in data['slots']}
        self.assertEqual(horas, {'12:00', '16:00'})
