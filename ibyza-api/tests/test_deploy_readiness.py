"""
Tests de preparación para deploy a producción.

Verifica que la configuración del proyecto es correcta
para un entorno de producción (Railway/Render).

Capa: Configuration + Security
Tecnicas ISTQB:
  - Verificación de configuración
  - Análisis de seguridad OWASP A05 (Security Misconfiguration)
"""
import os
from pathlib import Path
from django.test import TestCase, override_settings
from django.conf import settings


class ProductionConfigTest(TestCase):
    """Verifica que los patrones de configuración soportan producción."""

    def test_database_url_patron_produccion(self):
        """En producción sin DATABASE_URL, settings.py lanza excepción."""
        # Verificar que el patrón existe en settings.py
        settings_path = Path(settings.BASE_DIR) / 'ibyza' / 'settings.py'
        content = settings_path.read_text(encoding="utf-8")
        self.assertIn('DATABASE_URL', content)
        self.assertIn("raise Exception", content)

    def test_cors_configurable_via_env(self):
        """CORS_ALLOWED_ORIGINS debe ser configurable via variable de entorno."""
        settings_path = Path(settings.BASE_DIR) / 'ibyza' / 'settings.py'
        content = settings_path.read_text(encoding="utf-8")
        self.assertIn("CORS_ALLOWED_ORIGINS", content)
        self.assertIn("os.getenv", content)

    def test_culqi_keys_via_env(self):
        """Las claves Culqi deben venir de variables de entorno."""
        settings_path = Path(settings.BASE_DIR) / 'ibyza' / 'settings.py'
        content = settings_path.read_text(encoding="utf-8")
        self.assertIn("CULQI_PUBLIC_KEY", content)
        self.assertIn("CULQI_SECRET_KEY", content)

    def test_email_configurable_via_env(self):
        """Email debe ser configurable para producción (Resend)."""
        settings_path = Path(settings.BASE_DIR) / 'ibyza' / 'settings.py'
        content = settings_path.read_text(encoding="utf-8")
        self.assertIn("RESEND_API_KEY", content)
        self.assertIn("RESEND_FROM_EMAIL", content)
        self.assertIn("EMAIL_RECIPIENTS", content)

    def test_whitenoise_en_middleware(self):
        """WhiteNoise debe estar en middleware para servir estáticos."""
        middleware_classes = [m for m in settings.MIDDLEWARE]
        self.assertIn('whitenoise.middleware.WhiteNoiseMiddleware', middleware_classes)

    def test_whitenoise_despues_de_security(self):
        """WhiteNoise debe estar después de SecurityMiddleware."""
        security_idx = settings.MIDDLEWARE.index('django.middleware.security.SecurityMiddleware')
        whitenoise_idx = settings.MIDDLEWARE.index('whitenoise.middleware.WhiteNoiseMiddleware')
        self.assertGreater(whitenoise_idx, security_idx)

    def test_storages_usa_whitenoise(self):
        """STORAGES debe usar CompressedManifestStaticFilesStorage."""
        self.assertIn('staticfiles', settings.STORAGES)
        backend = settings.STORAGES['staticfiles']['BACKEND']
        self.assertIn('whitenoise', backend.lower())

    def test_allowed_hosts_configurable(self):
        """ALLOWED_HOSTS debe ser configurable via env."""
        settings_path = Path(settings.BASE_DIR) / 'ibyza' / 'settings.py'
        content = settings_path.read_text(encoding="utf-8")
        self.assertIn("ALLOWED_HOSTS", content)
        self.assertIn("os.getenv", content)

    def test_gunicorn_en_requirements(self):
        """gunicorn debe estar en requirements.txt."""
        req_path = Path(settings.BASE_DIR) / 'requirements.txt'
        content = req_path.read_text(encoding="utf-8")
        self.assertIn('gunicorn', content)

    def test_psycopg2_en_requirements(self):
        """psycopg2 para PostgreSQL debe estar en requirements."""
        req_path = Path(settings.BASE_DIR) / 'requirements.txt'
        content = req_path.read_text(encoding="utf-8")
        self.assertIn('psycopg2', content)

    def test_procfile_existe(self):
        """Procfile debe existir para Railway/Heroku."""
        procfile = Path(settings.BASE_DIR) / 'Procfile'
        self.assertTrue(procfile.exists())

    def test_railway_toml_existe(self):
        """railway.toml debe existir para Railway."""
        railway = Path(settings.BASE_DIR) / 'railway.toml'
        self.assertTrue(railway.exists())


class SecurityHeadersConfigTest(TestCase):
    """Verifica configuración de headers de seguridad para producción."""

    def test_security_settings_pattern_exists(self):
        """Las configuraciones de seguridad para producción deben existir."""
        settings_path = Path(settings.BASE_DIR) / 'ibyza' / 'settings.py'
        content = settings_path.read_text(encoding="utf-8")
        self.assertIn('SECURE_SSL_REDIRECT', content)
        self.assertIn('SECURE_HSTS_SECONDS', content)
        self.assertIn('SESSION_COOKIE_SECURE', content)
        self.assertIn('CSRF_COOKIE_SECURE', content)
        self.assertIn('SECURE_PROXY_SSL_HEADER', content)

    def test_hsts_seconds_es_un_anio(self):
        """HSTS debe configurarse por al menos un año (31536000s)."""
        settings_path = Path(settings.BASE_DIR) / 'ibyza' / 'settings.py'
        content = settings_path.read_text(encoding="utf-8")
        self.assertIn('31536000', content)

    def test_timezone_es_lima(self):
        """El timezone debe ser America/Lima para Perú."""
        self.assertEqual(settings.TIME_ZONE, 'America/Lima')

    def test_language_code_es_pe(self):
        """El idioma debe ser español de Perú."""
        self.assertEqual(settings.LANGUAGE_CODE, 'es-pe')

    def test_rest_framework_throttling_configurado(self):
        """Debe haber rate limiting global."""
        self.assertIn('DEFAULT_THROTTLE_CLASSES', settings.REST_FRAMEWORK)
        self.assertIn('DEFAULT_THROTTLE_RATES', settings.REST_FRAMEWORK)
        self.assertIn('anon', settings.REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'])
