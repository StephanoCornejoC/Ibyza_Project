"""
Management command para cargar la información faltante enviada por el cliente.

Contenido de INFO_FALTANTE_IBYZA:
- FACHADA/Fachada Boreal.png  -> Proyecto(slug='boreal').imagen_fachada
- PLANOS DE PLANTA/BOREAL.png      -> Nivel "Planta típica" de Boreal
- PLANOS DE PLANTA/CATOLICA.jpeg    -> Nivel "Planta típica" de Católica
- PLANOS DE PLANTA/MIRA VERDE.png  -> Nivel "Planta típica" de Mira Verde
- PLANOS DE PLANTA/PARKE 10.jpeg   -> Nivel "Planta típica" de Parke 10

Uso:
    python manage.py load_info_faltante
    python manage.py load_info_faltante --path "D:/otra/ruta/INFO_FALTANTE_IBYZA"
"""
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand

from projects.models import Nivel, Proyecto

DEFAULT_PATH = (
    r'D:\PROYECTOS\COREM\CLIENTES_COREM\IBYZA'
    r'\DOCUMENTACION_IBYZA\INFO_FALTANTE_IBYZA\INFO_FALTANTE_IBYZA'
)

PLANOS_MAP = {
    'BOREAL.png': 'boreal',
    'CATOLICA.jpeg': 'catolica',
    'MIRA VERDE.png': 'mira-verde',
    'PARKE 10.jpeg': 'parke-10',
}


class Command(BaseCommand):
    help = 'Carga fachada de Boreal y planos de planta desde INFO_FALTANTE_IBYZA.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--path', type=str, default=DEFAULT_PATH,
            help='Ruta a la carpeta INFO_FALTANTE_IBYZA descomprimida.',
        )

    def handle(self, *args, **options):
        base = Path(options['path'])
        if not base.exists():
            self.stderr.write(self.style.ERROR(f'No se encontró: {base}'))
            return

        # Asegurar directorios de media
        for subdir in ['proyectos', 'plantas']:
            (Path(settings.MEDIA_ROOT) / subdir).mkdir(parents=True, exist_ok=True)

        stats = {'fachadas': 0, 'planos': 0, 'errores': 0}

        # ── 1. Fachada de Boreal ──────────────────────────────────────────
        fachada = base / 'FACHADA' / 'Fachada Boreal.png'
        if fachada.exists():
            try:
                proyecto = Proyecto.objects.get(slug='boreal')
                with open(fachada, 'rb') as f:
                    proyecto.imagen_fachada.save('boreal-fachada.png', File(f), save=True)
                stats['fachadas'] += 1
                self.stdout.write(self.style.SUCCESS(
                    f'  + Fachada Boreal cargada ({fachada.stat().st_size // 1024} KB)'
                ))
            except Proyecto.DoesNotExist:
                self.stderr.write(self.style.ERROR('  Proyecto "boreal" no encontrado en DB'))
                stats['errores'] += 1
        else:
            self.stderr.write(self.style.WARNING(f'  Fachada no encontrada: {fachada}'))

        # ── 2. Planos de planta ───────────────────────────────────────────
        planos_dir = base / 'PLANOS DE PLANTA'
        if planos_dir.exists():
            for filename, slug in PLANOS_MAP.items():
                plano_path = planos_dir / filename
                if not plano_path.exists():
                    self.stderr.write(self.style.WARNING(f'  Plano no encontrado: {filename}'))
                    stats['errores'] += 1
                    continue

                try:
                    proyecto = Proyecto.objects.get(slug=slug)
                except Proyecto.DoesNotExist:
                    self.stderr.write(self.style.ERROR(f'  Proyecto "{slug}" no encontrado en DB'))
                    stats['errores'] += 1
                    continue

                # Crear o actualizar el Nivel "Planta típica"
                nivel, created = Nivel.objects.get_or_create(
                    proyecto=proyecto,
                    numero=1,
                    defaults={'nombre': 'Planta típica', 'orden': 1},
                )
                ext = plano_path.suffix.lower()
                media_filename = f'{slug}-planta-tipica{ext}'
                with open(plano_path, 'rb') as f:
                    nivel.imagen_planta.save(media_filename, File(f), save=True)
                stats['planos'] += 1

                action = 'Creado' if created else 'Actualizado'
                self.stdout.write(self.style.SUCCESS(
                    f'  + Plano {proyecto.nombre}: {media_filename} '
                    f'({action} nivel, {plano_path.stat().st_size // 1024} KB)'
                ))
        else:
            self.stderr.write(self.style.WARNING(f'  Carpeta PLANOS DE PLANTA no encontrada'))

        # ── Resumen ───────────────────────────────────────────────────────
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(
            f'Info faltante cargada: {stats["fachadas"]} fachadas, '
            f'{stats["planos"]} planos de planta. ({stats["errores"]} errores)'
        ))
