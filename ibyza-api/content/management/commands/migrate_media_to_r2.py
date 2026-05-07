"""
migrate_media_to_r2 — Migra todos los archivos de media/ al storage activo.

Uso:
    1. Configurar las env vars de R2 en .env (R2_ACCESS_KEY_ID, etc.)
    2. python manage.py migrate_media_to_r2
    3. Verificar que el bucket tenga los archivos
    4. (Opcional) Borrar media/ local despues de confirmar

Idempotente: si el archivo ya existe en el storage destino con el mismo nombre,
se omite (no se sobreescribe).
"""
from pathlib import Path
from django.apps import apps
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import models


class Command(BaseCommand):
    help = 'Migra archivos de media/ al storage activo (R2 si esta configurado).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run', action='store_true',
            help='Solo lista que se subiria, sin subir nada.',
        )
        parser.add_argument(
            '--overwrite', action='store_true',
            help='Sobreescribe archivos que ya existan en destino.',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        overwrite = options['overwrite']
        media_root = Path(settings.MEDIA_ROOT)

        if not media_root.exists():
            self.stdout.write(self.style.WARNING(f'No existe {media_root}'))
            return

        if not getattr(settings, 'USE_R2', False):
            self.stdout.write(self.style.WARNING(
                'USE_R2=False — el storage activo es filesystem. Esto no migra nada utilmente.\n'
                'Configura las variables R2_* en .env primero.'
            ))
            if not dry_run:
                return

        total = 0
        ok = 0
        skipped = 0
        missing = 0

        for model in apps.get_models():
            file_fields = [
                f for f in model._meta.get_fields()
                if isinstance(f, (models.ImageField, models.FileField))
            ]
            if not file_fields:
                continue

            for obj in model.objects.all():
                for field in file_fields:
                    file_field = getattr(obj, field.name)
                    if not file_field:
                        continue
                    name = file_field.name
                    if not name:
                        continue
                    total += 1

                    src = media_root / name
                    if not src.exists():
                        self.stdout.write(self.style.WARNING(f'  MISSING fs: {name}'))
                        missing += 1
                        continue

                    storage = file_field.storage

                    if storage.exists(name) and not overwrite:
                        self.stdout.write(f'  SKIP exists: {name}')
                        skipped += 1
                        continue

                    if dry_run:
                        self.stdout.write(f'  [DRY] would upload: {name} ({src.stat().st_size} bytes)')
                        ok += 1
                        continue

                    with open(src, 'rb') as f:
                        content = f.read()
                    if storage.exists(name) and overwrite:
                        storage.delete(name)
                    storage.save(name, ContentFile(content))
                    self.stdout.write(self.style.SUCCESS(f'  OK: {name} ({len(content)} bytes)'))
                    ok += 1

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(
            f'Total: {total} | Subidos: {ok} | Skip (existian): {skipped} | Faltantes en fs: {missing}'
        ))
