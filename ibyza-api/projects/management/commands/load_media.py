"""
Management command para cargar imágenes y PDFs reales desde DOCUMENTACION_IBYZA.

Mapea cada carpeta de documentación al proyecto correcto por slug y copia:
- Fachadas -> Proyecto.imagen_fachada
- Galería de fotos -> ImagenGaleria
- Avances de obra -> AvanceDeObra.imagen
- Brochures PDF -> Proyecto.catalogo_pdf

Uso:
    python manage.py load_media --docs-path "D:/PROYECTOS/COREM/CLIENTES_COREM/IBYZA/DOCUMENTACION_IBYZA"
    python manage.py load_media  # Usa ruta por defecto
"""
import os
import shutil
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand

from projects.models import AvanceDeObra, ImagenGaleria, Proyecto


# ══════════════════════════════════════════════════════════════════════════════
# MAPEO: carpeta de documentación -> slug del proyecto en DB
# ══════════════════════════════════════════════════════════════════════════════

PROYECTO_MAP = {
    '1. MIRA VERDE': {
        'slug': 'mira-verde',
        'fachada_dir': 'IMAGEN FACHADA',
        'galeria_dir': 'GALERIA DE FOTOS',
        'brochure': 'Brochure Mira Verde.pdf',
    },
    '2. BOLIVAR205': {
        'slug': 'bolivar-205',
        'fachada_dir': 'FACHADA',
        'galeria_dir': 'GALERIA DE FOTOS',
        'brochure': 'Brochure Bolivar 205.pdf',
    },
    '3. PARKE 10': {
        'slug': 'parke-10',
        'fachada_dir': 'FACHADA',
        'galeria_dir': 'GALERIA DE FOTOS',
        'brochure': 'Brochure Parke 10.pdf',
    },
    '4. CATOLICA': {
        'slug': 'catolica',
        'fachada_dir': 'FACHADA',
        'galeria_dir': 'GALERIA DE FOTOS',
        'brochure': 'Brochure Catolica.pdf',
    },
    '5. BOREAL': {
        'slug': 'boreal',
        'fachada_dir': 'FACHADA',
        'galeria_dir': 'GALERIA DE IMAGENES',
        'brochure': 'Brochure Boreal.pdf',
    },
}

# Mapeo para avances de obra (carpeta "3. AVANCE DE OBRA")
AVANCE_MAP = {
    '1. MIRA VERDE': 'mira-verde',
    '2. BOLIVAR 205': 'bolivar-205',
    '3. PARKE 10': 'parke-10',
    '4. CATOLICA': 'catolica',
    '5. BOREAL': 'boreal',
}

# Títulos descriptivos para avances según nombre del archivo
AVANCE_TITULOS = {
    'inicio': 'Inicio de obra',
    'demolicion': 'Demolición',
    'demolición': 'Demolición',
    'avance': 'Avance de obra',
}

DEFAULT_DOCS_PATH = (
    r'D:\PROYECTOS\COREM\CLIENTES_COREM\IBYZA\DOCUMENTACION_IBYZA'
)


class Command(BaseCommand):
    help = 'Carga imágenes y PDFs reales desde DOCUMENTACION_IBYZA a los modelos Django.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--docs-path',
            type=str,
            default=DEFAULT_DOCS_PATH,
            help='Ruta a la carpeta DOCUMENTACION_IBYZA.',
        )
        parser.add_argument(
            '--clear-gallery',
            action='store_true',
            help='Elimina todas las imágenes de galería existentes antes de cargar.',
        )

    def handle(self, *args, **options):
        docs_path = Path(options['docs_path'])
        proyectos_dir = docs_path / '2. PROYECTOS'
        avances_dir = docs_path / '3. AVANCE DE OBRA'

        if not docs_path.exists():
            self.stderr.write(self.style.ERROR(f'No se encontró: {docs_path}'))
            return

        if not proyectos_dir.exists():
            self.stderr.write(self.style.ERROR(f'No se encontró: {proyectos_dir}'))
            return

        # Asegurar que existan los directorios de media
        for subdir in ['proyectos', 'catalogos', 'galeria', 'avances']:
            (Path(settings.MEDIA_ROOT) / subdir).mkdir(parents=True, exist_ok=True)

        stats = {'fachadas': 0, 'brochures': 0, 'galeria': 0, 'avances': 0, 'errores': 0}

        if options['clear_gallery']:
            count = ImagenGaleria.objects.count()
            ImagenGaleria.objects.all().delete()
            self.stdout.write(self.style.WARNING(f'Eliminadas {count} imágenes de galería.'))

        # ── Procesar cada proyecto ─────────────────────────────────────────
        for carpeta, config in PROYECTO_MAP.items():
            proyecto_dir = proyectos_dir / carpeta
            if not proyecto_dir.exists():
                self.stderr.write(self.style.WARNING(f'  Carpeta no encontrada: {carpeta}'))
                stats['errores'] += 1
                continue

            try:
                proyecto = Proyecto.objects.get(slug=config['slug'])
            except Proyecto.DoesNotExist:
                self.stderr.write(self.style.WARNING(
                    f'  Proyecto no encontrado en DB: {config["slug"]}'
                ))
                stats['errores'] += 1
                continue

            self.stdout.write(self.style.MIGRATE_HEADING(f'\n{proyecto.nombre} ({config["slug"]})'))

            # Fachada
            stats['fachadas'] += self._load_fachada(proyecto, proyecto_dir, config['fachada_dir'])

            # Brochure PDF
            stats['brochures'] += self._load_brochure(proyecto, proyecto_dir, config['brochure'])

            # Galería
            stats['galeria'] += self._load_galeria(proyecto, proyecto_dir, config['galeria_dir'])

        # ── Procesar avances de obra ───────────────────────────────────────
        if avances_dir.exists():
            self.stdout.write(self.style.MIGRATE_HEADING('\nAvances de obra'))
            for carpeta, slug in AVANCE_MAP.items():
                avance_dir = avances_dir / carpeta
                if not avance_dir.exists():
                    continue
                try:
                    proyecto = Proyecto.objects.get(slug=slug)
                except Proyecto.DoesNotExist:
                    continue
                stats['avances'] += self._load_avances(proyecto, avance_dir)

        # ── Resumen ────────────────────────────────────────────────────────
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(
            f'Media cargado: '
            f'{stats["fachadas"]} fachadas, '
            f'{stats["brochures"]} brochures, '
            f'{stats["galeria"]} imágenes galería, '
            f'{stats["avances"]} avances de obra. '
            f'({stats["errores"]} errores)'
        ))

    def _load_fachada(self, proyecto, proyecto_dir, fachada_dir_name):
        fachada_path = proyecto_dir / fachada_dir_name / 'fachada.png'
        if not fachada_path.exists():
            self.stdout.write(self.style.WARNING(f'  Sin fachada: {fachada_path.name}'))
            return 0

        with open(fachada_path, 'rb') as f:
            filename = f'{proyecto.slug}-fachada.png'
            proyecto.imagen_fachada.save(filename, File(f), save=True)
        self.stdout.write(self.style.SUCCESS(f'  + Fachada: {filename}'))
        return 1

    def _load_brochure(self, proyecto, proyecto_dir, brochure_name):
        brochure_path = proyecto_dir / brochure_name
        if not brochure_path.exists():
            self.stdout.write(self.style.WARNING(f'  Sin brochure: {brochure_name}'))
            return 0

        with open(brochure_path, 'rb') as f:
            filename = f'{proyecto.slug}-brochure.pdf'
            proyecto.catalogo_pdf.save(filename, File(f), save=True)
        self.stdout.write(self.style.SUCCESS(f'  + Brochure: {filename}'))
        return 1

    def _load_galeria(self, proyecto, proyecto_dir, galeria_dir_name):
        galeria_dir = proyecto_dir / galeria_dir_name
        if not galeria_dir.exists():
            self.stdout.write(self.style.WARNING(f'  Sin galeria: {galeria_dir_name}'))
            return 0

        images = sorted(
            [f for f in galeria_dir.iterdir() if f.suffix.lower() in ('.png', '.jpg', '.jpeg', '.webp')],
            key=lambda f: f.name,
        )

        count = 0
        for idx, img_path in enumerate(images, start=1):
            filename = f'{proyecto.slug}-galeria-{idx}{img_path.suffix.lower()}'

            # Evitar duplicados: verificar si ya existe una imagen con esa descripción
            if ImagenGaleria.objects.filter(proyecto=proyecto, orden=idx).exists():
                img = ImagenGaleria.objects.get(proyecto=proyecto, orden=idx)
                with open(img_path, 'rb') as f:
                    img.imagen.save(filename, File(f), save=True)
                self.stdout.write(f'  ~ Galería actualizada: {filename}')
            else:
                img = ImagenGaleria(
                    proyecto=proyecto,
                    descripcion=f'{proyecto.nombre} - Foto {idx}',
                    orden=idx,
                )
                with open(img_path, 'rb') as f:
                    img.imagen.save(filename, File(f), save=False)
                img.save()
                self.stdout.write(self.style.SUCCESS(f'  + Galería: {filename}'))
            count += 1

        return count

    def _load_avances(self, proyecto, avance_dir):
        images = sorted(
            [f for f in avance_dir.iterdir() if f.suffix.lower() in ('.png', '.jpg', '.jpeg', '.webp')],
            key=lambda f: f.name,
        )

        count = 0
        avances_existentes = list(
            AvanceDeObra.objects.filter(proyecto=proyecto).order_by('fecha')
        )

        for img_path in images:
            filename = f'{proyecto.slug}-avance-{img_path.stem.replace(" ", "_").lower()}{img_path.suffix.lower()}'

            # Determinar título descriptivo del nombre del archivo
            stem_lower = img_path.stem.lower()
            titulo = None
            for key, val in AVANCE_TITULOS.items():
                if key in stem_lower:
                    # Extraer número si existe (e.g., "avance_1" -> "Avance de obra #1")
                    parts = stem_lower.split('_')
                    num = parts[-1] if parts[-1].isdigit() else ''
                    titulo = f'{val} #{num}' if num else val
                    break
            if not titulo:
                titulo = f'Avance - {img_path.stem}'

            # Intentar asignar imagen a avance existente sin imagen
            assigned = False
            for avance in avances_existentes:
                if not avance.imagen:
                    with open(img_path, 'rb') as f:
                        avance.imagen.save(filename, File(f), save=True)
                    avances_existentes.remove(avance)
                    self.stdout.write(self.style.SUCCESS(
                        f'  + Avance imagen -> {avance.titulo}: {filename}'
                    ))
                    assigned = True
                    count += 1
                    break

            # Si no hay avance sin imagen, crear uno nuevo
            if not assigned:
                from datetime import date
                avance = AvanceDeObra(
                    proyecto=proyecto,
                    titulo=titulo,
                    contenido=f'Registro fotográfico: {titulo}',
                    fecha=date.today(),
                    publicado=True,
                )
                with open(img_path, 'rb') as f:
                    avance.imagen.save(filename, File(f), save=False)
                avance.save()
                self.stdout.write(self.style.SUCCESS(f'  + Nuevo avance: {titulo} ({filename})'))
                count += 1

        return count
