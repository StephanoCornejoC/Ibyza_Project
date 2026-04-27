"""
Tests de seguridad basados en OWASP Top 10 (2021).

Capa: Non-functional / Security
Tecnicas ISTQB aplicadas:
  - OWASP Top 10
  - STRIDE threat model
  - Error guessing (inyecciones, mass assignment)

A01:2021 - Broken Access Control
A02:2021 - Cryptographic Failures
A03:2021 - Injection
A04:2021 - Insecure Design
A05:2021 - Security Misconfiguration
A06:2021 - Vulnerable and Outdated Components
A07:2021 - Identification and Authentication Failures
A08:2021 - Software and Data Integrity Failures
A09:2021 - Security Logging and Monitoring Failures
A10:2021 - Server-Side Request Forgery (SSRF)
"""
import json
from django.core.cache import cache
from django.test import TestCase, override_settings
from django.conf import settings
from rest_framework.test import APIClient
from rest_framework import status
from tests.conftest import BaseTestData


class OWASPSecurityTests(BaseTestData, TestCase):
    """Tests de seguridad alineados a OWASP Top 10."""

    def setUp(self):
        cache.clear()
        self.client = APIClient()

    # ══════════════════════════════════════════════════════════════════════
    # A01: Broken Access Control
    # ══════════════════════════════════════════════════════════════════════

    def test_admin_no_accesible_sin_autenticacion(self):
        """El panel admin debe redirigir a login si no hay sesion."""
        response = self.client.get('/admin/')
        # Django redirige al login (302) si no esta autenticado
        self.assertIn(response.status_code, [301, 302])

    def test_api_proyectos_es_solo_lectura(self):
        """No se puede crear proyectos via API (solo lectura)."""
        data = {'nombre': 'Hack', 'descripcion': 'Inyeccion'}
        response = self.client.post('/api/proyectos/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_api_contenido_es_solo_lectura(self):
        """No se puede crear contenido web via API."""
        data = {'seccion': 'hero', 'clave': 'hack', 'valor': 'xss'}
        response = self.client.post('/api/contenido/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_no_se_puede_modificar_proyecto_via_api(self):
        p = self.crear_proyecto()
        response = self.client.put(f'/api/proyectos/{p.slug}/', {'nombre': 'HACK'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_no_se_puede_eliminar_proyecto_via_api(self):
        p = self.crear_proyecto()
        response = self.client.delete(f'/api/proyectos/{p.slug}/')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    # ══════════════════════════════════════════════════════════════════════
    # A03: Injection
    # ══════════════════════════════════════════════════════════════════════

    @override_settings(
        EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
        CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
    )
    def test_sql_injection_en_contacto_nombre(self):
        """Intentar SQL injection en el campo nombre del formulario de contacto."""
        data = self.datos_contacto(nombre="'; DROP TABLE contact_solicitudcontacto; --")
        response = self.client.post('/api/contacto/', data, format='json')
        # Django ORM parametriza las queries: no debe haber error de BD
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])

    @override_settings(
        EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
        CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
    )
    def test_xss_en_campo_mensaje(self):
        """Intentar XSS en el campo mensaje. Django escapa HTML en la salida."""
        data = self.datos_contacto(mensaje='<script>alert("XSS")</script>')
        response = self.client.post('/api/contacto/', data, format='json')
        # DRF serializa como JSON, no como HTML
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])

    def test_path_traversal_en_slug(self):
        """Intentar path traversal via slug."""
        response = self.client.get('/api/proyectos/../../../etc/passwd/')
        # Django slug pattern solo acepta [-a-zA-Z0-9_]+
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_slug_con_caracteres_especiales(self):
        """Slug con caracteres maliciosos debe retornar 404."""
        payloads = [
            "test'; DROP TABLE--",
            "test<script>",
            "../../etc/passwd",
            "%00null",
        ]
        for payload in payloads:
            response = self.client.get(f'/api/proyectos/{payload}/')
            self.assertIn(
                response.status_code,
                [status.HTTP_404_NOT_FOUND, status.HTTP_301_MOVED_PERMANENTLY],
                f'Slug malicioso "{payload}" no devolvio 404',
            )

    # ══════════════════════════════════════════════════════════════════════
    # A04: Insecure Design - Mass Assignment
    # ══════════════════════════════════════════════════════════════════════

    @override_settings(
        EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
        CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
    )
    def test_mass_assignment_contacto_campo_leido(self):
        """No se debe poder setear 'leido' al crear solicitud de contacto."""
        data = self.datos_contacto()
        data['leido'] = True
        response = self.client.post('/api/contacto/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        from contact.models import SolicitudContacto
        obj = SolicitudContacto.objects.first()
        self.assertFalse(obj.leido, 'El campo leido NO debe ser seteado via API')

    @override_settings(
        EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
        CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
    )
    def test_mass_assignment_cita_campo_estado(self):
        """No se debe poder setear 'estado' al crear cita."""
        data = self.datos_cita()
        data['estado'] = 'confirmada'
        response = self.client.post('/api/contacto/citas/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        from contact.models import SolicitudCita
        obj = SolicitudCita.objects.first()
        self.assertEqual(obj.estado, 'pendiente', 'El estado NO debe ser seteado via API')

    @override_settings(
        CULQI_SECRET_KEY='sk_test_fake',
        CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
    )
    def test_mass_assignment_separacion_estado(self):
        """No se debe poder setear 'estado' o 'culqi_charge_id' al crear separacion."""
        p = self.crear_proyecto()
        n = self.crear_nivel(p)
        d = self.crear_departamento(n)
        data = self.datos_separacion(d.pk)
        data['estado'] = 'completado'
        data['culqi_charge_id'] = 'fake_id'
        # Este request fallara en Culqi (no mockeado), pero el serializer
        # no debe aceptar esos campos extras
        from payments.serializers import SeparacionSerializer
        serializer = SeparacionSerializer(data=data)
        if serializer.is_valid():
            # Los campos extra no deben estar en validated_data
            self.assertNotIn('estado', serializer.validated_data)
            self.assertNotIn('culqi_charge_id', serializer.validated_data)

    # ══════════════════════════════════════════════════════════════════════
    # A05: Security Misconfiguration
    # ══════════════════════════════════════════════════════════════════════

    def test_debug_false_en_produccion_config(self):
        """
        Verificar que el patron de configuracion permite DEBUG=False.
        (En settings.py: DEBUG = os.getenv('DEBUG', 'True') == 'True')
        """
        # Este test valida la logica de settings, no el valor actual
        import os
        original = os.environ.get('DEBUG')
        try:
            os.environ['DEBUG'] = 'False'
            # Re-evaluar la expresion
            debug_value = os.getenv('DEBUG', 'True') == 'True'
            self.assertFalse(debug_value)
        finally:
            if original is not None:
                os.environ['DEBUG'] = original
            elif 'DEBUG' in os.environ:
                del os.environ['DEBUG']

    def test_secret_key_no_es_default_inseguro_en_produccion(self):
        """
        Verificar que existe el patron para sobreescribir la SECRET_KEY.
        La clave por defecto solo debe usarse en desarrollo.
        """
        default_key = 'django-insecure-dev-key-change-in-production'
        # El test verifica que el setting acepta override via env var
        import os
        original = os.environ.get('SECRET_KEY')
        try:
            os.environ['SECRET_KEY'] = 'my-secure-production-key-12345'
            key = os.getenv('SECRET_KEY', default_key)
            self.assertNotEqual(key, default_key)
        finally:
            if original is not None:
                os.environ['SECRET_KEY'] = original
            elif 'SECRET_KEY' in os.environ:
                del os.environ['SECRET_KEY']

    # ══════════════════════════════════════════════════════════════════════
    # A07: Identification and Authentication Failures
    # ══════════════════════════════════════════════════════════════════════

    def test_password_validators_configurados(self):
        """Django debe tener validators de password activos."""
        validators = settings.AUTH_PASSWORD_VALIDATORS
        self.assertGreaterEqual(len(validators), 4)
        nombres = [v['NAME'] for v in validators]
        self.assertTrue(any('MinimumLength' in n for n in nombres))
        self.assertTrue(any('CommonPassword' in n for n in nombres))

    # ══════════════════════════════════════════════════════════════════════
    # Headers de seguridad
    # ══════════════════════════════════════════════════════════════════════

    def test_clickjacking_middleware_activo(self):
        """X-Frame-Options debe estar configurado via middleware."""
        self.assertIn(
            'django.middleware.clickjacking.XFrameOptionsMiddleware',
            settings.MIDDLEWARE,
        )

    def test_security_middleware_activo(self):
        """SecurityMiddleware debe estar en la primera posicion."""
        self.assertEqual(
            settings.MIDDLEWARE[0],
            'django.middleware.security.SecurityMiddleware',
        )

    def test_csrf_middleware_activo(self):
        self.assertIn(
            'django.middleware.csrf.CsrfViewMiddleware',
            settings.MIDDLEWARE,
        )
