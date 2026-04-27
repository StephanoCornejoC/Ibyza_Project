"""
Tests de integración para el envío de emails via Resend.

Verifica que los formularios de contacto y citas envían
notificaciones por email correctamente.

Capa: Integration
Tecnicas ISTQB:
  - Verificación de efectos secundarios (email enviado)
  - Error guessing (email falla silenciosamente)
"""
from unittest.mock import patch, MagicMock

from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status
from tests.conftest import BaseTestData


class ResendMockMixin:
    """Mixin que captura llamadas a Resend en self.sent_emails."""

    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.sent_emails = []

        # Patch resend.Emails.send (si resend esta instalado)
        self.resend_patcher = patch('resend.Emails.send')
        self.mock_resend = self.resend_patcher.start()

        def fake_send(params):
            self.sent_emails.append(params)
            return {'id': 'test-email-id-123'}

        self.mock_resend.side_effect = fake_send

    def tearDown(self):
        self.resend_patcher.stop()


@override_settings(
    RESEND_API_KEY='re_test_xxxxxxxxxxxxxxxx',
    EMAIL_RECIPIENTS=['admin@ibyza.com', 'ventas@ibyza.com'],
    CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
)
class ContactoEmailTest(ResendMockMixin, BaseTestData, TestCase):
    """Verifica que enviar un formulario de contacto dispara email via Resend."""

    def test_contacto_envia_email(self):
        data = self.datos_contacto()
        response = self.client.post('/api/contacto/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(self.sent_emails), 1)

    def test_contacto_email_tiene_subject_correcto(self):
        data = self.datos_contacto(nombre='Ana', apellido='Torres')
        self.client.post('/api/contacto/', data, format='json')
        subject = self.sent_emails[0]['subject']
        self.assertIn('[IBYZA]', subject)
        self.assertIn('Ana Torres', subject)

    def test_contacto_email_contiene_datos_del_formulario(self):
        data = self.datos_contacto(
            nombre='Pedro',
            apellido='Rios',
            email='pedro@test.com',
            telefono='987654321',
            mensaje='Quiero informacion sobre Catolica.',
        )
        self.client.post('/api/contacto/', data, format='json')
        email = self.sent_emails[0]
        body = email.get('text', '') + email.get('html', '')
        self.assertIn('Pedro', body)
        self.assertIn('pedro@test.com', body)
        self.assertIn('987654321', body)
        self.assertIn('Quiero informacion sobre Catolica.', body)

    def test_contacto_email_va_a_todos_los_destinatarios(self):
        data = self.datos_contacto()
        self.client.post('/api/contacto/', data, format='json')
        self.assertEqual(self.sent_emails[0]['to'], ['admin@ibyza.com', 'ventas@ibyza.com'])

    def test_contacto_sin_proyecto_interes_dice_no_especificado(self):
        data = self.datos_contacto()
        self.client.post('/api/contacto/', data, format='json')
        body = self.sent_emails[0].get('text', '')
        self.assertIn('No especificado', body)


@override_settings(
    RESEND_API_KEY='re_test_xxxxxxxxxxxxxxxx',
    EMAIL_RECIPIENTS=['admin@ibyza.com'],
    CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
)
class CitaEmailTest(ResendMockMixin, BaseTestData, TestCase):
    """Verifica que solicitar una cita dispara email via Resend."""

    def test_cita_envia_email(self):
        data = self.datos_cita()
        response = self.client.post('/api/contacto/citas/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(self.sent_emails), 1)

    def test_cita_email_incluye_tipo(self):
        data = self.datos_cita(tipo='virtual')
        self.client.post('/api/contacto/citas/', data, format='json')
        subject = self.sent_emails[0]['subject']
        self.assertIn('[IBYZA]', subject)
        self.assertIn('Google Meet', subject)

    def test_cita_presencial_en_subject(self):
        data = self.datos_cita(tipo='presencial')
        self.client.post('/api/contacto/citas/', data, format='json')
        self.assertIn('Presencial', self.sent_emails[0]['subject'])

    def test_cita_email_contiene_fecha_preferida(self):
        data = self.datos_cita()
        self.client.post('/api/contacto/citas/', data, format='json')
        body = self.sent_emails[0].get('text', '')
        self.assertIn('Fecha preferida:', body)

    def test_cita_sin_mensaje_dice_sin_mensaje(self):
        data = self.datos_cita()
        self.client.post('/api/contacto/citas/', data, format='json')
        body = self.sent_emails[0].get('text', '')
        self.assertIn('Sin mensaje', body)


@override_settings(
    RESEND_API_KEY='re_test_xxxxxxxxxxxxxxxx',
    EMAIL_RECIPIENTS=['admin@ibyza.com'],
    CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
)
class EmailFailureSilentTest(BaseTestData, TestCase):
    """Verifica que un fallo de email no rompe la solicitud."""

    def setUp(self):
        cache.clear()
        self.client = APIClient()

    def test_contacto_se_guarda_aunque_email_falle(self):
        """El formulario debe guardarse en BD aunque el email falle."""
        with patch('contact.views._send_notification', side_effect=Exception('Resend error')):
            data = self.datos_contacto()
            response = self.client.post('/api/contacto/', data, format='json')
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_cita_se_guarda_aunque_email_falle(self):
        with patch('contact.views._send_notification', side_effect=Exception('Resend error')):
            data = self.datos_cita()
            response = self.client.post('/api/contacto/citas/', data, format='json')
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
