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
    # ETag automático en respuestas GET → permite 304 Not Modified si el
    # cliente manda If-None-Match. Complementario a cache_page (que cachea en server).
    'django.middleware.http.ConditionalGetMiddleware',
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

# ─── Cache ────────────────────────────────────────────────────────────────────
# DatabaseCache: compartido entre workers de gunicorn via tabla en la misma DB.
# Sin Redis = sin costo extra en Railway. TTL corto + tabla pequeña por defecto.
#
# En modo test (manage.py test) usamos LocMemCache: rapido, in-memory, aislado por
# proceso. Esto evita acumulacion de contadores de DRF AnonRateThrottle entre
# tests (ver tests/test_security.py — 100/min sobre /api/contacto/).
import sys
_IS_TEST = 'test' in sys.argv

if _IS_TEST:
    # DummyCache: no-op. Evita que cache_page cachee respuestas entre tests
    # y que DRF AnonRateThrottle acumule contadores 429 cross-test.
    # Tests que prueben caching/throttle especifico usan @override_settings.
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
        },
    }
else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
            'LOCATION': 'django_cache_table',
            'TIMEOUT': 300,  # 5 min default
            'OPTIONS': {
                'MAX_ENTRIES': 1000,
                'CULL_FREQUENCY': 3,
            },
        },
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

# Subida de archivos: comprobantes de transferencia pueden pesar hasta ~10 MB.
# Default Django (2.5 MB) los rechaza con 400 antes de llegar a la vista.
DATA_UPLOAD_MAX_MEMORY_SIZE = 12 * 1024 * 1024  # 12 MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 12 * 1024 * 1024

# ─── Archivos estáticos y media ───────────────────────────────────────────────
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# === Media storage ===
# Por defecto: filesystem local (dev). Si hay credenciales R2 → Cloudflare R2.
# R2 es S3-compatible: usamos django-storages + boto3.
R2_ACCESS_KEY_ID = os.getenv('R2_ACCESS_KEY_ID', '')
R2_SECRET_ACCESS_KEY = os.getenv('R2_SECRET_ACCESS_KEY', '')
R2_BUCKET_NAME = os.getenv('R2_BUCKET_NAME', '')
R2_ENDPOINT_URL = os.getenv('R2_ENDPOINT_URL', '')
# URL publica del bucket (ej: https://pub-xxx.r2.dev o https://media.ibyzacorp.com).
# Si esta vacia, las URLs apuntan al endpoint S3 (mas feo pero funciona).
R2_PUBLIC_URL = os.getenv('R2_PUBLIC_URL', '').rstrip('/')

USE_R2 = bool(R2_ACCESS_KEY_ID and R2_BUCKET_NAME and R2_ENDPOINT_URL)

if USE_R2:
    STORAGES = {
        'default': {
            'BACKEND': 'storages.backends.s3.S3Storage',
            'OPTIONS': {
                'access_key': R2_ACCESS_KEY_ID,
                'secret_key': R2_SECRET_ACCESS_KEY,
                'bucket_name': R2_BUCKET_NAME,
                'endpoint_url': R2_ENDPOINT_URL,
                'region_name': 'auto',  # R2 ignora region pero boto3 la requiere
                'signature_version': 's3v4',
                'addressing_style': 'virtual',
                'default_acl': None,  # R2 no soporta ACLs
                'querystring_auth': False,  # URLs publicas sin firma
                'object_parameters': {
                    'CacheControl': 'public, max-age=31536000, immutable',
                },
                'custom_domain': R2_PUBLIC_URL.replace('https://', '').replace('http://', '') or None,
                'url_protocol': 'https:',
            },
        },
        'staticfiles': {
            'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
        },
    }
else:
    STORAGES = {
        'default': {
            'BACKEND': 'django.core.files.storage.FileSystemStorage',
        },
        'staticfiles': {
            'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
        },
    }

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
        'datos_bancarios': '5/min',
        'avance_comprador': '20/min',
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

# Destinatarios de notificaciones (contacto + citas).
# Configurar en Railway/Render con: EMAIL_RECIPIENTS=correo1@x.com,correo2@y.com
# Si no se configura en produccion, las notificaciones no se envian (no rompe la peticion).
EMAIL_RECIPIENTS = [
    e.strip()
    for e in os.getenv('EMAIL_RECIPIENTS', '').split(',')
    if e.strip()
]
if not EMAIL_RECIPIENTS and not DEBUG:
    import logging
    logging.getLogger('ibyza').warning(
        'EMAIL_RECIPIENTS no esta configurado. Las notificaciones de contacto y citas no se enviaran.'
    )

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
    # Logo del header del admin (mismo logo IBYZA del hero del sitio).
    "SITE_ICON": {
        "light": lambda request: "/static/content/favicon-64.png",
        "dark":  lambda request: "/static/content/favicon-64.png",
    },
    # Favicons del tab del browser para el admin.
    "SITE_FAVICONS": [
        {
            "rel": "icon",
            "sizes": "64x64",
            "type": "image/png",
            "href": lambda request: "/static/content/favicon-64.png",
        },
    ],
    # Persiste el scroll del sidebar entre navegaciones (sino al abrir
    # cualquier modulo el sidebar vuelve arriba y se pierde el hilo).
    # El archivo vive en `content/static/content/admin_sidebar_scroll.js`.
    "SCRIPTS": [
        lambda request: "/static/content/admin_sidebar_scroll.js",
    ],
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
    # Menu lateral organizado por frecuencia de uso (lo mas usado primero).
    # Cada item soporta `permission` callable que filtra por request.user.
    # El grupo "Usuarios y accesos" se esconde entero para non-superusers
    # gracias al monkey-patch de UnfoldAdminSite.get_sidebar_list en
    # `content.admin` (filtra grupos sin items visibles).
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": False,
        "navigation": [
            {
                "title": "Mensajes y citas",
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
                # Niveles, Galeria y Videos NO aparecen como links aqui:
                # son editables 100% inline desde la pagina del Proyecto.
                # Quedan accesibles por URL directa si Diana algun dia necesita
                # la vista plana (raro), pero fuera del sidebar para reducir
                # ruido y guiar el workflow contextual.
                "title": "Proyectos inmobiliarios",
                "separator": True,
                "items": [
                    {"title": "Proyectos",        "icon": "apartment",     "link": reverse_lazy("admin:projects_proyecto_changelist")},
                    {"title": "Departamentos",    "icon": "door_open",     "link": reverse_lazy("admin:projects_departamento_changelist")},
                    {"title": "Avances de obra",  "icon": "construction",  "link": reverse_lazy("admin:projects_avancedeobra_changelist")},
                ],
            },
            {
                # Nota: el modelo `Beneficio` (Valores) NO aparece como link
                # separado aqui — esta embebido en el changelist de
                # "Textos e imagenes" bajo Pagina Nosotros > Lo que nos define.
                # Esto da una vista CMS unificada para Diana en un solo lugar.
                "title": "Contenido del sitio",
                "separator": True,
                "items": [
                    {"title": "Configuracion general", "icon": "settings",  "link": reverse_lazy("admin:content_configuracionsitio_changelist")},
                    {"title": "Textos e imagenes",     "icon": "edit_note", "link": reverse_lazy("admin:content_contenidoweb_changelist")},
                ],
            },
            {
                "title": "Pagos / Separaciones",
                "separator": True,
                "items": [
                    {"title": "Separaciones recibidas", "icon": "payments", "link": reverse_lazy("admin:payments_separacion_changelist")},
                ],
            },
            {
                "title": "Usuarios y accesos",
                "separator": True,
                "items": [
                    {
                        "title": "Usuarios del panel",
                        "icon": "person",
                        "link": reverse_lazy("admin:auth_user_changelist"),
                        "permission": lambda request: bool(request.user and request.user.is_superuser),
                    },
                    {
                        "title": "Grupos de permisos",
                        "icon": "group",
                        "link": reverse_lazy("admin:auth_group_changelist"),
                        "permission": lambda request: bool(request.user and request.user.is_superuser),
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

# ─── CSRF Trusted Origins ────────────────────────────────────────────────────
# Django 4+ requiere lista explicita de origins con esquema para validar CSRF
# en POST al admin desde HTTPS. Sin esto, Diana no puede loguearse al admin
# en Railway (CSRF token rechazado).
#
# Setear como env var en Railway:
#   CSRF_TRUSTED_ORIGINS=https://ibyza-api.up.railway.app,https://api.ibyzacorp.com
CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.getenv('CSRF_TRUSTED_ORIGINS', '').split(',')
    if origin.strip()
]

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
