"""Elimina el entry huerfano `pagina=nosotros, seccion=valores, clave=valores`
de ContenidoWeb. Era texto suelto migrado de `seccion=nosotros, clave=valores`
pero el frontend NO lo consume — los valores reales vienen del modelo
`Beneficio` (renderizado en ValuesCarousel.jsx).

Asi la seccion "Lo que nos define" del admin queda vacia en ContenidoWeb y
se rellena con los 6 Beneficios embebidos por el changelist custom.
"""
from django.db import migrations


def forwards(apps, schema_editor):
    ContenidoWeb = apps.get_model('content', 'ContenidoWeb')
    ContenidoWeb.objects.filter(
        pagina='nosotros', seccion='valores', clave='valores',
    ).delete()


def backwards(apps, schema_editor):
    """No restauramos (era data muerta)."""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0013_data_alinear_entries_con_frontend'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
