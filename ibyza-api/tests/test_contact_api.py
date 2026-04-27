"""
Tests de API para la app contact.

Capa: API/Service + Unit (serializers)
Tecnicas ISTQB aplicadas:
  - Particion de equivalencia (datos validos/invalidos)
  - Analisis de valores limite (campos vacios, limites de longitud)
  - Error guessing (email invalido, telefono con letras, fecha pasada)
"""
from datetime import timedelta
from django.core.cache import cache
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from contact.models import SolicitudContacto, SolicitudCita
from tests.conftest import BaseTestData


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
)
class SolicitudContactoAPITest(BaseTestData, TestCase):
    """Tests para POST /api/contacto/"""

    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.url = '/api/contacto/'

    # ── Caso exitoso ─────────────────────────────────────────────────────

    def test_crear_solicitud_contacto_valida(self):
        data = self.datos_contacto()
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(SolicitudContacto.objects.count(), 1)

    def test_solicitud_contacto_guarda_datos_correctos(self):
        data = self.datos_contacto(nombre='Ana', apellido='Torres', email='ana@test.com')
        self.client.post(self.url, data, format='json')
        obj = SolicitudContacto.objects.first()
        self.assertEqual(obj.nombre, 'Ana')
        self.assertEqual(obj.apellido, 'Torres')
        self.assertEqual(obj.email, 'ana@test.com')
        self.assertFalse(obj.leido)

    def test_solicitud_contacto_con_proyecto_interes(self):
        data = self.datos_contacto(proyecto_interes='Bolivar 205')
        self.client.post(self.url, data, format='json')
        obj = SolicitudContacto.objects.first()
        self.assertEqual(obj.proyecto_interes, 'Bolivar 205')

    # ── Validaciones de campos requeridos ────────────────────────────────

    def test_nombre_requerido(self):
        data = self.datos_contacto()
        del data['nombre']
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('nombre', response.data)

    def test_email_requerido(self):
        data = self.datos_contacto()
        del data['email']
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_mensaje_requerido(self):
        data = self.datos_contacto()
        del data['mensaje']
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_telefono_requerido(self):
        data = self.datos_contacto()
        del data['telefono']
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('telefono', response.data)

    # ── Validaciones de formato ──────────────────────────────────────────

    def test_email_invalido_rechazado(self):
        data = self.datos_contacto(email='no-es-email')
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_telefono_con_letras_rechazado(self):
        data = self.datos_contacto(telefono='abc-no-valido')
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('telefono', response.data)

    def test_telefono_muy_corto_rechazado(self):
        data = self.datos_contacto(telefono='123')
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('telefono', response.data)

    def test_mensaje_vacio_rechazado(self):
        data = self.datos_contacto(mensaje='   ')
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_mensaje_excesivamente_largo_rechazado(self):
        data = self.datos_contacto(mensaje='A' * 5001)
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ── Solo POST permitido ──────────────────────────────────────────────

    def test_get_no_permitido(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_put_no_permitido(self):
        response = self.client.put(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete_no_permitido(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
)
class SolicitudCitaAPITest(BaseTestData, TestCase):
    """Tests para POST /api/contacto/citas/"""

    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.url = '/api/contacto/citas/'

    # ── Caso exitoso ─────────────────────────────────────────────────────

    def test_crear_cita_valida(self):
        data = self.datos_cita()
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(SolicitudCita.objects.count(), 1)

    def test_cita_estado_default_pendiente(self):
        data = self.datos_cita()
        self.client.post(self.url, data, format='json')
        obj = SolicitudCita.objects.first()
        self.assertEqual(obj.estado, 'pendiente')

    def test_cita_tipo_virtual(self):
        data = self.datos_cita(tipo='virtual')
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(SolicitudCita.objects.first().tipo, 'virtual')

    # ── Validaciones ─────────────────────────────────────────────────────

    def test_fecha_pasada_rechazada(self):
        fecha_pasada = (timezone.now() - timedelta(days=1)).isoformat()
        data = self.datos_cita(fecha_preferida=fecha_pasada)
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('fecha_preferida', response.data)

    def test_nombre_requerido(self):
        data = self.datos_cita()
        del data['nombre']
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_email_requerido(self):
        data = self.datos_cita()
        del data['email']
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_telefono_invalido_rechazado(self):
        data = self.datos_cita(telefono='abc')
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('telefono', response.data)

    def test_tipo_invalido_rechazado(self):
        data = self.datos_cita(tipo='zoom')  # no existe en choices
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('tipo', response.data)

    # ── Solo POST ────────────────────────────────────────────────────────

    def test_get_no_permitido(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
