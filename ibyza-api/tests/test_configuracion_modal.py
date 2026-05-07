"""
Tests para los nuevos campos de ConfiguracionSitio (Sprint 2):
  - Modal de bienvenida
  - Meet link permanente
  - Origen del nombre

Capa: Unit (modelo)
Tecnicas ISTQB:
  - Verificacion de defaults
  - Particion de equivalencia (campos vacios/llenos)
"""
from django.test import TestCase

from content.models import ConfiguracionSitio


class ConfiguracionModalTest(TestCase):
    """Verifica que ConfiguracionSitio tiene los nuevos campos con defaults razonables."""

    def test_singleton_se_crea_con_defaults(self):
        config = ConfiguracionSitio.get_solo()
        self.assertIsNotNone(config)
        self.assertEqual(config.pk, 1)

    def test_origen_nombre_tiene_texto_por_default(self):
        config = ConfiguracionSitio.get_solo()
        self.assertIn('IBYZA', config.origen_nombre_texto)
        self.assertIn('Ibáñez', config.origen_nombre_texto)
        self.assertIn('Zavala', config.origen_nombre_texto)

    def test_modal_activo_por_default_es_false(self):
        config = ConfiguracionSitio.get_solo()
        self.assertFalse(config.modal_activo)

    def test_modal_titulo_default(self):
        config = ConfiguracionSitio.get_solo()
        self.assertTrue(len(config.modal_titulo) > 0)

    def test_modal_subtitulo_default(self):
        config = ConfiguracionSitio.get_solo()
        self.assertTrue(len(config.modal_subtitulo) > 0)

    def test_modal_imagen_inicia_vacia(self):
        config = ConfiguracionSitio.get_solo()
        self.assertFalse(bool(config.modal_imagen))

    def test_modal_proyecto_inicia_null(self):
        config = ConfiguracionSitio.get_solo()
        self.assertIsNone(config.modal_proyecto)

    def test_modal_cta_texto_default(self):
        config = ConfiguracionSitio.get_solo()
        self.assertEqual(config.modal_cta_texto, 'Ver proyecto')

    def test_modal_cta_es_whatsapp_default_false(self):
        config = ConfiguracionSitio.get_solo()
        self.assertFalse(config.modal_cta_es_whatsapp)

    def test_meet_link_permanente_inicia_vacio(self):
        config = ConfiguracionSitio.get_solo()
        self.assertEqual(config.meet_link_permanente, '')

    def test_modal_se_puede_activar_y_persistir(self):
        config = ConfiguracionSitio.get_solo()
        config.modal_activo = True
        config.modal_titulo = 'Bolivar 205'
        config.save()

        config_recargado = ConfiguracionSitio.get_solo()
        self.assertTrue(config_recargado.modal_activo)
        self.assertEqual(config_recargado.modal_titulo, 'Bolivar 205')

    def test_meet_link_se_puede_setear(self):
        config = ConfiguracionSitio.get_solo()
        config.meet_link_permanente = 'https://meet.google.com/abc-defg-hij'
        config.save()

        config_recargado = ConfiguracionSitio.get_solo()
        self.assertEqual(
            config_recargado.meet_link_permanente,
            'https://meet.google.com/abc-defg-hij',
        )

    def test_politicas_privacidad_html_default_no_vacio(self):
        config = ConfiguracionSitio.get_solo()
        self.assertIn('Lorem', config.politicas_privacidad_html)
