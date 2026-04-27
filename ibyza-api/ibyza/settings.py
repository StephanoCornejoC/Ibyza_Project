import os
from pathlib import Path
from django.urls import reverse_lazy
import dj_database_url
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# ─── Core ─────────────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-dev-key-change-in-production')
DEBUG = os.getenv('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# ─── Apps ─────────────────────────────────────────────────────────────────────
INSTALLED_APPS = [
    # django-unfold DEBE ir antes de django.contrib.admin
    'unfold',
    'unfold.contrib.filters',
    'unfold.contrib.forms',

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Terceros
    'rest_framework',
    'corsheaders',
    'django_filters',

    # Apps IBYZA
    'projects',
    'contact',
    'payments',
    'content',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'ibyza.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'ibyza.wsgi.application'

# ─── Base de datos ────────────────────────────────────────────────────────────
# Sin DATABASE_URL o vacío → SQLite en desarrollo
# Con DATABASE_URL          → PostgreSQL en producción (Railway/Render la generan solos)
_database_url = os.getenv('DATABASE_URL', '').strip()
if _database_url:
    DATABASES = {'default': dj_database_url.parse(_database_url, conn_max_age=600)}
elif not DEBUG:
    raise Exception('DATABASE_URL es requerido en producción. No se puede usar SQLite.')
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'es-pe'
TIME_ZONE = 'America/Lima'
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ─── Archivos estáticos y media ───────────────────────────────────────────────
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:5173,http://localhost:5174,http://localhost:3000'
).split(',')

# ─── Django REST Framework ────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.AllowAny'],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/min',
    },
}

# ─── Email (Resend) ──────────────────────────────────────────────────────────
# Resend (https://resend.com) — 3000 emails/mes gratis, alta deliverability.
#
# Comportamiento:
# - Si RESEND_API_KEY esta seteada: envia email real via Resend API
# - Si no esta y DEBUG=True: imprime el email en consola (dev)
# - Si no esta y DEBUG=False: loguea error (no rompe la peticion)
RESEND_API_KEY = os.getenv('RESEND_API_KEY', '')

# Dominio "from" — por defecto el dominio de prueba de Resend (no requiere DNS).
# Cuando el cliente verifique ibyzacorp.com en Resend, cambiar a:
#   RESEND_FROM_EMAIL=IBYZA <no-reply@ibyzacorp.com>
RESEND_FROM_EMAIL = os.getenv('RESEND_FROM_EMAIL', 'IBYZA <onboarding@resend.dev>')

# Destinatarios de notificaciones (contacto + citas)
# EMAIL_RECIPIENTS=correo1@x.com,correo2@y.com
EMAIL_RECIPIENTS = [
    e.strip()
    for e in os.getenv(
        'EMAIL_RECIPIENTS',
        'stephano.cornejoc@gmail.com,valeriaemanuel1@gmail.com',
    ).split(',')
    if e.strip()
]

# Legacy — mantenemos EMAIL_BACKEND para fallbacks y comandos Django (send_mail etc)
if DEBUG:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
else:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
DEFAULT_FROM_EMAIL = RESEND_FROM_EMAIL

# ─── Culqi ────────────────────────────────────────────────────────────────────
CULQI_PUBLIC_KEY = os.getenv('CULQI_PUBLIC_KEY', '')
CULQI_SECRET_KEY = os.getenv('CULQI_SECRET_KEY', '')

# ─── Admin: django-unfold ─────────────────────────────────────────────────────
UNFOLD = {
    "SITE_TITLE": "IBYZA",
    "SITE_HEADER": "IBYZA — Panel de Gestión",
    "SITE_SUBHEADER": "Administra tu sitio web inmobiliario",
    "SITE_URL": "/",
    "SHOW_HISTORY": True,
    "SHOW_VIEW_ON_SITE": False,
    # Colores de marca IBYZA (azul #0F233B)
    "COLORS": {
        "primary": {
            "50":  "240 244 248",
            "100": "217 228 237",
            "200": "179 200 219",
            "300": "141 173 200",
            "400": "103 145 182",
            "500": "65  117 163",
            "600": "46  90  130",
            "700": "31  66  98",
            "800": "21  44  69",
            "900": "15  35  59",
            "950": "9   24  39",
        },
    },
    # Menú lateral organizado por secciones de negocio
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": False,
        "navigation": [
            {
                "title": "🏢 Proyectos inmobiliarios",
                "separator": True,
                "items": [
                    {
                        "title": "Proyectos",
                        "icon": "apartment",
                        "link": reverse_lazy("admin:projects_proyecto_changelist"),
                    },
                    {
                        "title": "Pisos / Niveles",
                        "icon": "stacks",
                        "link": reverse_lazy("admin:projects_nivel_changelist"),
                    },
                    {
                        "title": "Departamentos",
                        "icon": "door_open",
                        "link": reverse_lazy("admin:projects_departamento_changelist"),
                    },
                    {
                        "title": "Avances de obra",
                        "icon": "construction",
                        "link": reverse_lazy("admin:projects_avancedeobra_changelist"),
                    },
                    {
                        "title": "Galería de fotos",
                        "icon": "photo_library",
                        "link": reverse_lazy("admin:projects_imagengaleria_changelist"),
                    },
                    {
                        "title": "Videos",
                        "icon": "play_circle",
                        "link": reverse_lazy("admin:projects_videoproyecto_changelist"),
                    },
                ],
            },
            {
                "title": "📨 Mensajes y citas",
                "separator": True,
                "items": [
                    {
                        "title": "Mensajes de contacto",
                        "icon": "mail",
                        "link": reverse_lazy("admin:contact_solicitudcontacto_changelist"),
                        "badge": "contact.SolicitudContacto.objects.filter(leido=False).count",
                    },
                    {
                        "title": "Citas solicitadas",
                        "icon": "calendar_today",
                        "link": reverse_lazy("admin:contact_solicitudcita_changelist"),
                    },
                ],
            },
            {
                "title": "💳 Pagos / Separaciones",
                "separator": True,
                "items": [
                    {
                        "title": "Separaciones recibidas",
                        "icon": "payments",
                        "link": reverse_lazy("admin:payments_separacion_changelist"),
                    },
                ],
            },
            {
                "title": "🌐 Contenido del sitio",
                "separator": True,
                "items": [
                    {
                        "title": "Configuración general",
                        "icon": "settings",
                        "link": reverse_lazy("admin:content_configuracionsitio_changelist"),
                    },
                    {
                        "title": "Textos e imágenes",
                        "icon": "edit_note",
                        "link": reverse_lazy("admin:content_contenidoweb_changelist"),
                    },
                    {
                        "title": "Preguntas frecuentes",
                        "icon": "help",
                        "link": reverse_lazy("admin:content_preguntafrecuente_changelist"),
                    },
                    {
                        "title": "Testimonios",
                        "icon": "format_quote",
                        "link": reverse_lazy("admin:content_testimonio_changelist"),
                    },
                    {
                        "title": "Beneficios / Valores",
                        "icon": "star",
                        "link": reverse_lazy("admin:content_beneficio_changelist"),
                    },
                ],
            },
            {
                "title": "👥 Usuarios y accesos",
                "separator": True,
                "items": [
                    {
                        "title": "Usuarios del panel",
                        "icon": "person",
                        "link": reverse_lazy("admin:auth_user_changelist"),
                    },
                    {
                        "title": "Grupos de permisos",
                        "icon": "group",
                        "link": reverse_lazy("admin:auth_group_changelist"),
                    },
                ],
            },
        ],
    },
}

# ─── Seguridad en producción ─────────────────────────────────────────────────
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# ─── Logging ─────────────────────────────────────────────────────────────────
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{asctime}] {levelname} {name}: {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}
