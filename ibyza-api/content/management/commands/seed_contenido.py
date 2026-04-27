"""
Management command para cargar el contenido web real de IBYZA.
Datos extraídos de: MANUAL_DE_MARCA.pdf y REQUERIMIENTOS PAGINA WEB IBYZA.pdf

Uso:
    python manage.py seed_contenido
"""
from django.core.management.base import BaseCommand
from content.models import ContenidoWeb


CONTENIDOS = [
    # ─── Hero (Inicio) ────────────────────────────────────────────────────
    {
        'seccion': 'hero',
        'clave': 'titulo',
        'valor': 'Tu mejor inversión al mejor precio y en la mejor ubicación',
    },
    {
        'seccion': 'hero',
        'clave': 'subtitulo',
        'valor': 'Desarrollamos proyectos inmobiliarios que generan valor en las mejores zonas de Arequipa.',
    },
    {
        'seccion': 'hero',
        'clave': 'cta_texto',
        'valor': 'Conoce nuestros proyectos',
    },
    {
        'seccion': 'hero',
        'clave': 'indicador_anos',
        'valor': '6',
    },
    {
        'seccion': 'hero',
        'clave': 'indicador_vendidas',
        'valor': '195',
    },
    {
        'seccion': 'hero',
        'clave': 'indicador_entregadas',
        'valor': '50',
    },

    # ─── Nosotros ────────────────────────────────────────────────────────
    {
        'seccion': 'nosotros',
        'clave': 'historia',
        'valor': (
            'IBYZA nace en 2020 con nuestro primer proyecto inmobiliario. '
            'El nombre surge de la unión de los apellidos Ibáñez y Zavala. '
            'Desde el inicio, hemos dedicado especial atención a escuchar a '
            'nuestros clientes y mejorar continuamente, consolidándonos como '
            'una empresa de confianza en el sector inmobiliario de Arequipa.'
        ),
    },
    {
        'seccion': 'nosotros',
        'clave': 'mision',
        'valor': (
            'Desarrollar proyectos inmobiliarios en áreas consolidadas de Arequipa, '
            'generando mayor valor para nuestros clientes a través de ubicaciones '
            'estratégicas, diseño funcional y acabados de calidad.'
        ),
    },
    {
        'seccion': 'nosotros',
        'clave': 'vision',
        'valor': (
            'Ser el referente local en desarrollo inmobiliario sostenible, '
            'reconocidos por la calidad de nuestros proyectos y el valor '
            'que generamos para inversionistas y familias.'
        ),
    },
    {
        'seccion': 'nosotros',
        'clave': 'valores',
        'valor': 'Compromiso, Integridad, Innovación, Sostenibilidad, Profesionalismo',
    },
    # Estadísticas editables (página Nosotros)
    {
        'seccion': 'nosotros',
        'clave': 'stat_anos',
        'valor': '6',
    },
    {
        'seccion': 'nosotros',
        'clave': 'stat_vendidas',
        'valor': '195',
    },
    {
        'seccion': 'nosotros',
        'clave': 'stat_proyectos',
        'valor': '6',
    },
    {
        'seccion': 'nosotros',
        'clave': 'stat_entregadas',
        'valor': '50',
    },
    # Propuesta de valor / Compromiso (para cards Misión/Visión)
    {
        'seccion': 'nosotros',
        'clave': 'propuesta_valor',
        'valor': (
            'Dedicamos especial atención a escuchar a nuestros clientes y mejorar '
            'continuamente. Cada proyecto es construido con los más altos estándares, '
            'garantizando que tu inversión sea segura.'
        ),
    },

    # ─── Contacto ────────────────────────────────────────────────────────
    {
        'seccion': 'contacto',
        'clave': 'direccion',
        'valor': 'Puente Bolívar 205, Umacollo, Arequipa',
    },
    {
        'seccion': 'contacto',
        'clave': 'telefono',
        'valor': '+51 993 674 174',
    },
    {
        'seccion': 'contacto',
        'clave': 'email',
        'valor': 'ventas@ibyzacorp.com',
    },
    {
        'seccion': 'contacto',
        'clave': 'horario',
        'valor': 'Lunes a viernes: 9:00 AM – 6:00 PM | Sábados: 9:00 AM – 1:00 PM',
    },
    {
        'seccion': 'contacto',
        'clave': 'whatsapp',
        'valor': '+51993674174',
    },
    {
        'seccion': 'contacto',
        'clave': 'google_maps_url',
        'valor': 'https://maps.app.goo.gl/V3n7qrHMhNoHf2of7',
    },

    # ─── Footer ──────────────────────────────────────────────────────────
    {
        'seccion': 'footer',
        'clave': 'slogan',
        'valor': 'Tu mejor inversión al mejor precio y en la mejor ubicación.',
    },
    {
        'seccion': 'footer',
        'clave': 'facebook',
        'valor': 'https://www.facebook.com/profile.php?id=61580984001744',
    },
    {
        'seccion': 'footer',
        'clave': 'dominio',
        'valor': 'ibyzacorp.com',
    },
]


class Command(BaseCommand):
    help = 'Carga el contenido web real de IBYZA (textos del hero, nosotros, contacto, footer).'

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for data in CONTENIDOS:
            obj, created = ContenidoWeb.objects.update_or_create(
                seccion=data['seccion'],
                clave=data['clave'],
                defaults={'valor': data['valor'], 'activo': True},
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(self.style.SUCCESS(
            f'Contenido cargado: {created_count} creados, {updated_count} actualizados.'
        ))
        self.stdout.write(self.style.WARNING(
            'NOTA: Las imágenes del hero y nosotros deben cargarse desde el panel de administración.'
        ))
