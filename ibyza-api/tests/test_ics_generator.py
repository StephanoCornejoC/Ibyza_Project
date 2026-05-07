"""
Tests para el generador de archivos .ics (RFC 5545).

Capa: Unit
Tecnicas ISTQB:
  - Verificacion de estructura (presencia de bloques requeridos)
  - Particion de equivalencia (cita virtual vs presencial)
"""
from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from contact.ics import generar_ics_cita
from contact.models import SolicitudCita
from content.models import ConfiguracionSitio


class IcsGeneratorTest(TestCase):
    """Verifica el generador minimo de .ics."""

    def setUp(self):
        self.fecha = timezone.now() + timedelta(days=2)

    def _crear_cita(self, **kwargs):
        defaults = {
            'nombre': 'Maria',
            'apellido': 'Lopez',
            'email': 'maria@test.com',
            'telefono': '987654321',
            'tipo': 'presencial',
            'fecha_preferida': self.fecha,
            'mensaje': '',
        }
        defaults.update(kwargs)
        return SolicitudCita.objects.create(**defaults)

    def test_ics_contiene_bloques_obligatorios(self):
        cita = self._crear_cita()
        ics = generar_ics_cita(cita)
        self.assertIn('BEGIN:VCALENDAR', ics)
        self.assertIn('END:VCALENDAR', ics)
        self.assertIn('BEGIN:VEVENT', ics)
        self.assertIn('END:VEVENT', ics)
        self.assertIn('VERSION:2.0', ics)
        self.assertIn('UID:', ics)
        self.assertIn('DTSTART:', ics)
        self.assertIn('DTEND:', ics)
        self.assertIn('SUMMARY:', ics)
        self.assertIn('LOCATION:', ics)

    def test_ics_summary_incluye_tipo_de_cita(self):
        cita = self._crear_cita(tipo='presencial')
        ics = generar_ics_cita(cita)
        self.assertIn('Cita IBYZA', ics)
        self.assertIn('Presencial', ics)

    def test_ics_virtual_con_meet_usa_link_como_location(self):
        config = ConfiguracionSitio.get_solo()
        config.meet_link_permanente = 'https://meet.google.com/abc-defg-hij'
        config.save()

        cita = self._crear_cita(tipo='virtual')
        ics = generar_ics_cita(cita)
        self.assertIn('meet.google.com/abc-defg-hij', ics)

    def test_ics_presencial_usa_direccion_como_location(self):
        config = ConfiguracionSitio.get_solo()
        config.direccion = 'Puente Bolivar 205, Umacollo, Arequipa'
        config.save()

        cita = self._crear_cita(tipo='presencial')
        ics = generar_ics_cita(cita)
        self.assertIn('Puente Bolivar 205', ics)

    def test_ics_incluye_nombre_solicitante_en_descripcion(self):
        cita = self._crear_cita(nombre='Carlos', apellido='Garcia')
        ics = generar_ics_cita(cita)
        self.assertIn('Carlos Garcia', ics)

    def test_ics_termina_con_crlf(self):
        cita = self._crear_cita()
        ics = generar_ics_cita(cita)
        # Las lineas .ics deben terminar con CRLF
        self.assertIn('\r\n', ics)
