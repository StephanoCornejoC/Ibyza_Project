"""Crea (o actualiza) el usuario operativo del admin (Diana) y el grupo
`Administracion IBYZA` con permisos limitados sobre los modelos de negocio.
NO superuser — el usuario no puede crear/borrar usuarios ni cambiar permisos.

Idempotente: corre cuantas veces quieras, no duplica nada. Si el usuario
ya existe, mantiene su password actual (no la reescribe). Si es la primera
vez y no se provee password (ni por arg ni por env var DIANA_PASSWORD), se
genera una random con `secrets.token_urlsafe(16)` y se muestra en stdout.

Uso:
    python manage.py setup_diana                            # genera password random
    python manage.py setup_diana --password 'NuevaPass!'    # password explicita
    DIANA_PASSWORD=xxx python manage.py setup_diana         # via env var
    python manage.py setup_diana --reset-password           # fuerza reset con random

El grupo `Administracion IBYZA` recibe permisos add/change/view/delete sobre:
    - projects.*          (Proyecto, Departamento, Nivel, AvanceObra, ImagenProyecto, etc.)
    - payments.*          (Separacion y relacionados)
    - contact.*           (SolicitudContacto, SolicitudCita)
    - content.*           (ContenidoWeb, ConfiguracionSitio, Beneficio)

Explicitamente NO recibe permisos sobre:
    - auth.*              (User, Group, Permission)
    - admin.*             (LogEntry)
    - sessions.*          (Session)
    - contenttypes.*      (ContentType)
"""
import os
import secrets

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.core.management.base import BaseCommand


# Apps de negocio que el usuario operativo puede gestionar.
APPS_PERMITIDAS = ['projects', 'payments', 'contact', 'content']

DEFAULT_USERNAME = 'admin.ibyzacorp'
DEFAULT_EMAIL = 'admin@ibyzacorp.com'
DEFAULT_GROUP_NAME = 'Administracion IBYZA'


def _generate_password(length: int = 16) -> str:
    """Genera una password aleatoria URL-safe (cripto-fuerte)."""
    return secrets.token_urlsafe(length)


class Command(BaseCommand):
    help = 'Crea/actualiza el usuario operativo del admin y su grupo de permisos.'

    def add_arguments(self, parser):
        parser.add_argument('--password', type=str, default=None,
                            help='Password inicial. Si se omite, se genera una random.')
        parser.add_argument('--reset-password', action='store_true',
                            help='Forzar reset del password con uno random.')
        parser.add_argument('--email', type=str, default=DEFAULT_EMAIL)
        parser.add_argument('--username', type=str, default=DEFAULT_USERNAME)

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        # Prioridad: --password explicito > DIANA_PASSWORD env var > random generada.
        # Eliminado el default hardcoded (era leak de GitHub Secret Scanning).
        password = (
            options['password']
            or os.environ.get('DIANA_PASSWORD')
            or _generate_password()
        )
        force_reset = options['reset_password']

        # ─── 1. Crear/actualizar grupo con permisos ───────────────────────────
        group, _ = Group.objects.get_or_create(name=DEFAULT_GROUP_NAME)

        # Limpiar permisos previos (idempotencia limpia: si algun dia se restringe
        # mas, el grupo refleja el estado actual deseado).
        group.permissions.clear()

        permisos = []
        for app_label in APPS_PERMITIDAS:
            cts = ContentType.objects.filter(app_label=app_label)
            for ct in cts:
                perms = Permission.objects.filter(content_type=ct)
                permisos.extend(perms)

        group.permissions.set(permisos)
        self.stdout.write(self.style.SUCCESS(
            f'Grupo "{DEFAULT_GROUP_NAME}": {len(permisos)} permisos asignados '
            f'sobre {", ".join(APPS_PERMITIDAS)}.'
        ))

        # ─── 2. Crear/actualizar usuario diana ────────────────────────────────
        User = get_user_model()
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'first_name': 'Diana',
                'last_name': 'Silva',
                'is_staff': True,        # puede entrar al admin
                'is_superuser': False,   # NO puede gestionar usuarios/grupos
                'is_active': True,
            },
        )

        # Asegurar flags correctos en cada corrida.
        user.is_staff = True
        user.is_superuser = False
        user.is_active = True
        user.email = email

        if created or force_reset:
            user.set_password(password)
            password_action = 'creado' if created else 'reseteado'
            self.stdout.write(self.style.WARNING(
                f'Password {password_action}: "{password}" '
                f'(decile a Diana que lo cambie desde su perfil).'
            ))

        user.save()

        # Asegurar membresia al grupo.
        user.groups.add(group)

        self.stdout.write(self.style.SUCCESS(
            f'Usuario "{username}" {"creado" if created else "ya existia"}, '
            f'staff=True, superuser=False, miembro de "{DEFAULT_GROUP_NAME}".'
        ))
        self.stdout.write('')
        self.stdout.write('Diana entra al admin en: /admin/login/')
        self.stdout.write(f'  Usuario: {username}')
        if created or force_reset:
            self.stdout.write(f'  Password: {password}  (CAMBIAR en el primer login)')
        else:
            self.stdout.write('  Password: (la que ya tenia — usa --reset-password para forzar reset)')
