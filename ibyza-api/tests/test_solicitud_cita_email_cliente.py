"""
Tests para verificar que la solicitud de cita envia un email
de confirmacion al solicitante con el archivo .ics adjunto.

Capa: Integration
Tecnicas ISTQB:
  - Verificacion de efectos secundarios (email + adjunto)
"""
from unittest.mock import patch

from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework import status

from tests.conftest import BaseTestData


@override_settings(
    RESEND_API_KEY='re_test_xxxxxxxxxxxxxxxx',
    EMAIL_RECIPIENTS=['admin@ibyza.com'],
    CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
)
class CitaEmailClienteTest(BaseTestData, TestCase):
    """Verifica que al crear una cita se envia un email al solicitante con .ics."""

    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.sent_emails = []

        self.resend_patcher = patch('resend.Emails.send')
        self.mock_resend = self.resend_patcher.start()

        def fake_send(params):
            self.sent_emails.append(params)
            return {'id': 'test-email-id-123'}

        self.mock_resend.side_effect = fake_send

    def tearDown(self):
        self.resend_patcher.stop()

    def test_se_envian_dos_emails_admin_y_solicitante(self):
        """Debe enviarse un email al admin y otro al solicitante."""
        data = self.datos_cita(email='cliente@test.com')
        response = self.client.post('/api/contacto/citas/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(self.sent_emails), 2)

    def test_email_solicitante_va_a_su_propio_email(self):
        data = self.datos_cita(email='cliente@test.com')
        self.client.post('/api/contacto/citas/', data, format='json')

        # Buscar el email enviado al cliente (no al admin)
        cliente_emails = [e for e in self.sent_emails if e['to'] == ['cliente@test.com']]
        self.assertEqual(len(cliente_emails), 1)

    def test_email_solicitante_tiene_attachment_ics(self):
        data = self.datos_cita(email='cliente@test.com')
        self.client.post('/api/contacto/citas/', data, format='json')

        cliente_emails = [e for e in self.sent_emails if e['to'] == ['cliente@test.com']]
        self.assertTrue(len(cliente_emails) >= 1)
        email = cliente_emails[0]
        self.assertIn('attachments', email)
        attachments = email['attachments']
        self.assertEqual(len(attachments), 1)
        self.assertEqual(attachments[0]['filename'], 'cita-ibyza.ics')
        self.assertIn('content', attachments[0])
        # El content debe estar en base64 (no vacio)
        self.assertTrue(len(attachments[0]['content']) > 0)

    def test_email_solicitante_subject_no_tiene_emojis(self):
        data = self.datos_cita(email='cliente@test.com')
        self.client.post('/api/contacto/citas/', data, format='json')

        cliente_emails = [e for e in self.sent_emails if e['to'] == ['cliente@test.com']]
        subject = cliente_emails[0]['subject']
        self.assertIn('[IBYZA]', subject)
        # No debe haber check mark u otros emojis comunes
        self.assertNotIn('✓', subject)
        self.assertNotIn('✅', subject)

    def test_email_admin_no_tiene_attachments_ics(self):
        """El email al admin no incluye .ics (solo es notificacion interna)."""
        data = self.datos_cita(email='cliente@test.com')
        self.client.post('/api/contacto/citas/', data, format='json')

        admin_emails = [e for e in self.sent_emails if e['to'] == ['admin@ibyza.com']]
        self.assertEqual(len(admin_emails), 1)
        # El email admin no debe incluir attachments
        self.assertNotIn('attachments', admin_emails[0])

    def test_cita_virtual_incluye_meet_link_si_configurado(self):
        from content.models import ConfiguracionSitio
        config = ConfiguracionSitio.get_solo()
        config.meet_link_permanente = 'https://meet.google.com/abc-defg-hij'
        config.save()

        data = self.datos_cita(email='cliente@test.com', tipo='virtual')
        self.client.post('/api/contacto/citas/', data, format='json')

        cliente_emails = [e for e in self.sent_emails if e['to'] == ['cliente@test.com']]
        body = cliente_emails[0].get('text', '') + cliente_emails[0].get('html', '')
        self.assertIn('meet.google.com/abc-defg-hij', body)
