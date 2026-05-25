"""Data migration: limpia los 4 entries placeholder de Beneficio (Ubicacion,
Calidad, Asesoria, Financiamiento) y seedea los 6 valores reales que estaban
hardcoded en ValuesCarousel.jsx. Cada uno con su imagen relativa a MEDIA_ROOT
(que ya fue copiada a media/valores/<nombre>.webp).

Idempotente: si ya existen Beneficios con esos titulos, los actualiza en
vez de crear duplicados.
"""
from django.db import migrations


VALORES_INICIALES = [
    {
        'titulo': 'Compromiso',
        'descripcion': 'Nos comprometemos con la satisfacción total de nuestros clientes y el desarrollo de la comunidad.',
        'imagen': 'valores/compromiso.webp',
        'icono': 'Shield',
        'orden': 10,
    },
    {
        'titulo': 'Integridad',
        'descripcion': 'Construimos relaciones duraderas basadas en la transparencia y la honestidad en cada decisión.',
        'imagen': 'valores/integridad.webp',
        'icono': 'Star',
        'orden': 20,
    },
    {
        'titulo': 'Innovación',
        'descripcion': 'Incorporamos las últimas tendencias en diseño arquitectónico y tecnologías constructivas.',
        'imagen': 'valores/innovacion.webp',
        'icono': 'Zap',
        'orden': 30,
    },
    {
        'titulo': 'Sostenibilidad',
        'descripcion': 'Desarrollamos proyectos responsables con el medio ambiente y el entorno urbano.',
        'imagen': 'valores/sostenibilidad.webp',
        'icono': 'Heart',
        'orden': 40,
    },
    {
        'titulo': 'Profesionalismo',
        'descripcion': 'Un equipo altamente calificado que acompaña cada etapa del proceso de inversión.',
        'imagen': 'valores/profesionalismo.webp',
        'icono': 'Users',
        'orden': 50,
    },
    {
        'titulo': 'Calidad',
        'descripcion': 'Cada proyecto es ejecutado con los más altos estándares de construcción y acabados premium.',
        'imagen': 'valores/calidad.webp',
        'icono': 'Award',
        'orden': 60,
    },
]


def forwards(apps, schema_editor):
    Beneficio = apps.get_model('content', 'Beneficio')

    # Eliminar los 4 placeholders viejos (no se usan en ningun lado).
    Beneficio.objects.filter(
        titulo__in=['Ubicacion privilegiada', 'Calidad garantizada',
                    'Asesoria personalizada', 'Financiamiento flexible']
    ).delete()

    # Seedear los 6 valores reales (idempotente con update_or_create).
    for v in VALORES_INICIALES:
        Beneficio.objects.update_or_create(
            titulo=v['titulo'],
            defaults={
                'descripcion': v['descripcion'],
                'imagen': v['imagen'],
                'icono': v['icono'],
                'orden': v['orden'],
                'activo': True,
            },
        )


def backwards(apps, schema_editor):
    """Borra los 6 valores seedeados. NO restaura los placeholders viejos
    porque no aportaban valor."""
    Beneficio = apps.get_model('content', 'Beneficio')
    Beneficio.objects.filter(
        titulo__in=[v['titulo'] for v in VALORES_INICIALES]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0010_alter_beneficio_options_beneficio_imagen_and_more'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
