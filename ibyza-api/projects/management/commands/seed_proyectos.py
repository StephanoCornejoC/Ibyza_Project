"""
Management command para cargar los 6 proyectos inmobiliarios reales de IBYZA.
Datos extraídos de: REQUERIMIENTOS PAGINA WEB IBYZA.pdf y DOCUMENTACION_IBYZA.

Uso:
    python manage.py seed_proyectos
    python manage.py seed_proyectos --clear  # Limpia y recrea todo
"""
from decimal import Decimal
from datetime import date
from pathlib import Path
from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand
from projects.models import Proyecto, Nivel, Departamento, AvanceDeObra, VideoProyecto


# Departamentos disponibles iniciales por slug de proyecto.
# Solo Catolica tiene unidades disponibles segun la documentacion del cliente.
# El resto de proyectos esta vendido o en preventa sin unidades cargadas todavia.
DEPARTAMENTOS_DISPONIBLES = {
    'catolica': [
        {'piso': 9,  'codigo': '901',  'tipo': '2dorm', 'area_total': Decimal('69.67'), 'area_techada': Decimal('65.00'), 'precio': Decimal('98900'), 'estado': 'disponible'},
        {'piso': 10, 'codigo': '1001', 'tipo': '2dorm', 'area_total': Decimal('69.67'), 'area_techada': Decimal('65.00'), 'precio': Decimal('98900'), 'estado': 'disponible'},
        {'piso': 11, 'codigo': '1101', 'tipo': '2dorm', 'area_total': Decimal('69.67'), 'area_techada': Decimal('65.00'), 'precio': Decimal('98900'), 'estado': 'disponible'},
    ],
}


# ══════════════════════════════════════════════════════════════════════════════
# DATOS REALES DE IBYZA — Fuente: documentación del cliente
# ══════════════════════════════════════════════════════════════════════════════

PROYECTOS = [
    {
        'nombre': 'Mira Verde',
        'slug': 'mira-verde',
        'descripcion_corta': '10 departamentos exclusivos en Cayma con acabados premium y dúplex con piscina privada.',
        'descripcion': (
            'MIRA VERDE es un proyecto residencial ubicado en la Urb. Santa Elisa, '
            'Los Ángeles de Cayma. Cuenta con 10 departamentos de 1, 2, 3 y 4 habitaciones, '
            'con metrajes desde 46 m² hasta 240 m². Incluye 2 dúplex con piscina privada '
            'y sótano para bicicletas. Una propuesta exclusiva para quienes buscan calidad '
            'de vida en una zona consolidada de Arequipa.'
        ),
        'ubicacion': 'Urb. Santa Elisa, Los Ángeles de Cayma, Cayma, Arequipa',
        'google_maps_embed': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3827.0!2d-71.55!3d-16.38!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDIyJzQ4LjAiUyA3McKwMzMnMDAuMCJX!5e0!3m2!1ses!2spe!4v1',
        'estado': 'vendido',
        'precio_desde': Decimal('54000'),
        'orden': 1,
        'empresa_receptora': 'IB Y ZA INGENIERIA Y CONSTRUCCIÓN S.A.C',
        'empresa_ruc': '20606454776',
        'empresa_banco': 'BCP - Banco de Crédito del Perú',
        'cuenta_soles': '215-4217314-0-47',
        'cci_soles': '002-21500421731404728',
        'cuenta_dolares': '215-9294966-1-69',
        'cci_dolares': '002-21500929496616925',
        'videos': [
            {'titulo': 'Recorrido Mira Verde', 'youtube_url': 'https://www.youtube.com/watch?v=wuVcPvby4dk', 'orden': 1},
        ],
        'avances': [
            {'titulo': 'Proyecto finalizado', 'contenido': 'MIRA VERDE ha sido completamente entregado. Todos los departamentos fueron vendidos exitosamente.', 'fecha': date(2020, 12, 1)},
        ],
    },
    {
        'nombre': 'Bolívar 205',
        'slug': 'bolivar-205',
        'descripcion_corta': '40 departamentos con vistas al Misti, terraza con piscina y dúplex exclusivos.',
        'descripcion': (
            'BOLÍVAR 205 es un proyecto residencial de 40 departamentos ubicado en '
            'Puente Bolívar 205, Umacollo. Con metrajes desde 28 m² hasta 154 m², '
            'ofrece 6 dúplex (3 con piscina privada), terraza con piscina comunitaria, '
            'área de ejercicio y vistas privilegiadas al volcán Misti. '
            'Proyecto totalmente entregado.'
        ),
        'ubicacion': 'Puente Bolívar 205, Umacollo, Arequipa',
        'google_maps_embed': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3827.5!2d-71.53!3d-16.39!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDIzJzI0LjAiUyA3McKwMzEnNDguMCJX!5e0!3m2!1ses!2spe!4v1',
        'estado': 'vendido',
        'precio_desde': Decimal('45000'),
        'orden': 2,
        'empresa_receptora': 'IB Y ZA INGENIERIA Y CONSTRUCCIÓN S.A.C',
        'empresa_ruc': '20606454776',
        'empresa_banco': 'BCP - Banco de Crédito del Perú',
        'cuenta_soles': '215-4217314-0-47',
        'cci_soles': '002-21500421731404728',
        'cuenta_dolares': '215-9294966-1-69',
        'cci_dolares': '002-21500929496616925',
        'videos': [],
        'avances': [
            {'titulo': 'Proyecto entregado', 'contenido': 'BOLÍVAR 205 fue completamente entregado en 2024. Todos los departamentos fueron vendidos.', 'fecha': date(2024, 6, 1)},
        ],
    },
    {
        'nombre': 'Parke 10',
        'slug': 'parke-10',
        'descripcion_corta': '~50 departamentos frente al Parque Biella con piscina y zona de parrillas.',
        'descripcion': (
            'PARKE 10 se ubica en la Urb. Magisterial I, Mz J Lt10, Umacollo, '
            'frente al Parque Biella. Ofrece aproximadamente 50 departamentos de '
            '1 y 2 habitaciones, con metrajes de 29 a 70 m². Cuenta con piscina, '
            'zona de parrillas y una ubicación privilegiada frente al parque. '
            'Proyecto en construcción con departamentos disponibles.'
        ),
        'ubicacion': 'Urb. Magisterial I, Mz J Lt10 - Umacollo, Arequipa',
        'google_maps_embed': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3827.5!2d-71.53!3d-16.39!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDIzJzI0LjAiUyA3McKwMzEnNDguMCJX!5e0!3m2!1ses!2spe!4v1',
        'estado': 'vendido',
        'precio_desde': Decimal('48900'),
        'orden': 3,
        'empresa_receptora': 'IB Y ZA INGENIERIA Y CONSTRUCCIÓN S.A.C',
        'empresa_ruc': '20606454776',
        'empresa_banco': 'BCP - Banco de Crédito del Perú',
        'cuenta_soles': '215-4217314-0-47',
        'cci_soles': '002-21500421731404728',
        'cuenta_dolares': '215-9294966-1-69',
        'cci_dolares': '002-21500929496616925',
        'videos': [],
        'avances': [
            {'titulo': 'Proyecto entregado', 'contenido': 'PARKE 10 fue completamente entregado. Todas las 52 unidades fueron vendidas.', 'fecha': date(2025, 3, 1)},
        ],
    },
    {
        'nombre': 'Católica',
        'slug': 'catolica',
        'descripcion_corta': '51 unidades con piscina infinita, coworking y tiendas comerciales. 3 departamentos disponibles desde $98,900 USD.',
        'descripcion': (
            'CATÓLICA es un proyecto de uso mixto ubicado en Antero Peralta 46, '
            'Arequipa. Ofrece 51 unidades incluyendo departamentos de 28 a 80 m², '
            '3 tiendas comerciales y una oficina. Incluye piscina infinita, espacio de coworking '
            'y 2 sótanos de estacionamiento. Quedan 3 departamentos disponibles '
            'en pisos 9, 10 y 11 de 69.67 m² a $98,900 USD cada uno.'
        ),
        'ubicacion': 'Antero Peralta 46, Arequipa',
        'google_maps_embed': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3827.5!2d-71.53!3d-16.39!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDIzJzI0LjAiUyA3McKwMzEnNDguMCJX!5e0!3m2!1ses!2spe!4v1',
        'estado': 'en_venta',
        'precio_desde': Decimal('98900'),
        'orden': 4,
        'empresa_receptora': 'GRUPO INMOBILIARIO IBYZA PERU S.A.C',
        'empresa_ruc': '',
        'empresa_banco': '',
        'cuenta_soles': '',
        'cci_soles': '',
        'cuenta_dolares': '',
        'cci_dolares': '',
        'videos': [
            {'titulo': 'Recorrido Católica', 'youtube_url': 'https://www.youtube.com/watch?v=wOemHf9-5AE', 'orden': 1},
        ],
        'avances': [
            {'titulo': 'Inicio de construcción', 'contenido': 'Se iniciaron los trabajos de CATÓLICA. Demolición completada, excavación en progreso.', 'fecha': date(2025, 6, 1)},
            {'titulo': 'Avance 2026', 'contenido': 'Estructura de sótanos completada. Primeros niveles en construcción.', 'fecha': date(2026, 2, 1)},
        ],
    },
    {
        'nombre': 'Boreal',
        'slug': 'boreal',
        'descripcion_corta': '34 departamentos frente a parque con ascensor vehicular y 2 sótanos. Proyecto entregado.',
        'descripcion': (
            'BOREAL se ubica en Gonzalo Vigil 105, Umacollo, frente a un parque. '
            'Ofrece 34 departamentos de 29 a 53 m². Cuenta con 2 sótanos de '
            'estacionamiento y ascensor vehicular. Ubicación privilegiada frente a parque '
            'en zona residencial consolidada. Proyecto completamente entregado.'
        ),
        'ubicacion': 'Gonzalo Vigil 105, Umacollo, Arequipa',
        'google_maps_embed': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3827.5!2d-71.53!3d-16.39!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDIzJzI0LjAiUyA3McKwMzEnNDguMCJX!5e0!3m2!1ses!2spe!4v1',
        'estado': 'vendido',
        'precio_desde': Decimal('48900'),
        'orden': 5,
        'empresa_receptora': 'DESARROLLO INMOBILIARIO IBYZA AQP',
        'empresa_ruc': '',
        'empresa_banco': '',
        'cuenta_soles': '',
        'cci_soles': '',
        'cuenta_dolares': '',
        'cci_dolares': '',
        'videos': [
            {'titulo': 'Recorrido Boreal', 'youtube_url': 'https://www.youtube.com/watch?v=_LX6OAUEYjQ', 'orden': 1},
        ],
        'avances': [
            {'titulo': 'Proyecto entregado', 'contenido': 'BOREAL fue completamente entregado. Todas las 34 unidades fueron vendidas.', 'fecha': date(2025, 12, 1)},
        ],
    },
    {
        'nombre': 'IBYZA Tower',
        'slug': 'ibyza-tower',
        'descripcion_corta': 'Edificio de uso mixto: oficinas + departamentos con vistas al Misti.',
        'descripcion': (
            'IBYZA TOWER es un edificio de uso mixto ubicado en Prol. Av. Ejército 522, '
            'Cerro Colorado. Los 5 primeros niveles están destinados a oficinas, y desde '
            'el piso 6 se ubican los departamentos residenciales. Ofrece vistas al volcán '
            'Misti, piscina, zona de parrillas y 2 sótanos de estacionamiento. '
            'El proyecto emblema de IBYZA.'
        ),
        'ubicacion': 'Prol. Av. Ejército 522, Cerro Colorado, Arequipa',
        'google_maps_embed': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3827.5!2d-71.53!3d-16.39!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDIzJzI0LjAiUyA3McKwMzEnNDguMCJX!5e0!3m2!1ses!2spe!4v1',
        'estado': 'preventa',
        'precio_desde': Decimal('48900'),
        'orden': 6,
        'empresa_receptora': 'IBYZA LUXURY',
        'empresa_ruc': '',
        'empresa_banco': '',
        'cuenta_soles': '',
        'cci_soles': '',
        'cuenta_dolares': '',
        'cci_dolares': '',
        'videos': [],
        'avances': [],
    },
]


class Command(BaseCommand):
    help = 'Carga los 6 proyectos inmobiliarios reales de IBYZA con datos de la documentación.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Elimina todos los proyectos existentes antes de crear los nuevos.',
        )

    def _cargar_fachada(self, proyecto):
        """
        Carga la fachada desde seed_assets/proyectos/<slug>/fachada.<ext> al
        ImageField si el campo esta vacio O si apunta a un archivo que ya no
        existe en el storage activo (caso tipico: filesystem efimero de Render
        que pierde media/ en cada deploy).

        NO recarga si la fachada existe fisicamente — eso preserva cualquier
        imagen que Diana haya subido desde el admin.
        """
        seed_assets = Path(settings.BASE_DIR) / 'seed_assets' / 'proyectos' / proyecto.slug
        if not seed_assets.exists():
            return False

        fachada_path = next(iter(seed_assets.glob('fachada.*')), None)
        if not fachada_path:
            return False

        # Solo recargamos si NO hay imagen, o si el archivo fisico desaparecio
        ya_existe = bool(proyecto.imagen_fachada) and proyecto.imagen_fachada.storage.exists(
            proyecto.imagen_fachada.name
        )
        if ya_existe:
            return False

        with open(fachada_path, 'rb') as f:
            proyecto.imagen_fachada.save(fachada_path.name, File(f), save=True)
        return True

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Eliminando proyectos existentes...'))
            Proyecto.objects.all().delete()

        created_count = 0
        skipped_count = 0
        fachadas_cargadas = 0

        for data in PROYECTOS:
            videos = data.pop('videos', [])
            avances = data.pop('avances', [])

            slug = data['slug']
            proyecto, created = Proyecto.objects.get_or_create(
                slug=slug,
                defaults=data,
            )

            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'  + Creado: {proyecto.nombre}'))
            else:
                skipped_count += 1
                self.stdout.write(f'  = Ya existia (no tocado): {proyecto.nombre}')

            # Cargar fachada si falta (sea porque el proyecto es nuevo, o porque
            # el archivo fisico se perdio en el ultimo deploy de Render efimero).
            if self._cargar_fachada(proyecto):
                fachadas_cargadas += 1
                self.stdout.write(self.style.SUCCESS(
                    f'    fachada cargada desde seed_assets'
                ))

            # Videos: get_or_create por (proyecto, youtube_url)
            for video_data in videos:
                VideoProyecto.objects.get_or_create(
                    proyecto=proyecto,
                    youtube_url=video_data['youtube_url'],
                    defaults=video_data,
                )

            # Avances de obra: get_or_create por (proyecto, titulo)
            for avance_data in avances:
                AvanceDeObra.objects.get_or_create(
                    proyecto=proyecto,
                    titulo=avance_data['titulo'],
                    defaults=avance_data,
                )

            # Departamentos disponibles iniciales (idempotente por codigo+nivel)
            for depto_data in DEPARTAMENTOS_DISPONIBLES.get(slug, []):
                nivel, _ = Nivel.objects.get_or_create(
                    proyecto=proyecto,
                    numero=depto_data['piso'],
                    defaults={'nombre': f'Piso {depto_data["piso"]}', 'orden': depto_data['piso']},
                )
                Departamento.objects.get_or_create(
                    nivel=nivel,
                    codigo=depto_data['codigo'],
                    defaults={
                        'tipo': depto_data['tipo'],
                        'area_total': depto_data['area_total'],
                        'area_techada': depto_data['area_techada'],
                        'precio': depto_data['precio'],
                        'estado': depto_data['estado'],
                    },
                )

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(
            f'Seed completado: {created_count} creados, '
            f'{skipped_count} ya existian (no tocados), '
            f'{fachadas_cargadas} fachadas cargadas desde seed_assets.'
        ))
        self.stdout.write(self.style.WARNING(
            'NOTA: Las imagenes de galeria, planos y catalogo PDF se cargan '
            'desde el panel de administracion Django.'
        ))
        self.stdout.write(self.style.WARNING(
            'NOTA: Los departamentos individuales con metrajes y precios deben '
            'cargarse desde el panel admin o importando el Excel de disponibilidad.'
        ))
