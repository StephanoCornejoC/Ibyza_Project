"""
Crea un superusuario automaticamente si no existe.

Uso en Railway/Render:
  DJANGO_SUPERUSER_USERNAME=admin
  DJANGO_SUPERUSER_EMAIL=admin@ibyza.com
  DJANGO_SUPERUSER_PASSWORD=<seguro>
  python manage.py create_admin
"""
import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Crea superusuario desde variables de entorno si no existe.'

    def handle(self, *args, **options):
        username = os.getenv('DJANGO_SUPERUSER_USERNAME', 'admin')
        email = os.getenv('DJANGO_SUPERUSER_EMAIL', '')
        password = os.getenv('DJANGO_SUPERUSER_PASSWORD', '')

        if not password:
            self.stdout.write(self.style.WARNING(
                'DJANGO_SUPERUSER_PASSWORD no configurado. Omitiendo creacion de admin.'
            ))
            return

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.SUCCESS(
                f'Superusuario "{username}" ya existe. Sin cambios.'
            ))
            return

        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
        )
        self.stdout.write(self.style.SUCCESS(
            f'Superusuario "{username}" creado exitosamente.'
        ))
