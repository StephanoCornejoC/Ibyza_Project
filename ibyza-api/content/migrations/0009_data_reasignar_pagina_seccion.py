"""Data migration: reasigna los 25 entries existentes de ContenidoWeb al nuevo
schema (pagina, seccion).

Mapeo:
- seccion=hero         -> pagina=inicio,   seccion=hero
- seccion=nosotros     -> pagina=nosotros, seccion=(hero | mision_vision | valores)
                          + caso especial: clave=historia -> pagina=inicio, seccion=quienes_somos
                            (porque la historia solo se usa en el AboutPreview del Home,
                             no en la pagina Nosotros).
- seccion=contacto     -> pagina=contacto, seccion=info_contacto
- seccion=footer       -> pagina=global,   seccion=footer

Tambien asigna un `orden` razonable dentro de cada seccion para que el listado
del admin tenga un orden estable (titulo primero, luego subtitulo, etc.).
"""
from django.db import migrations


# (clave_actual, nueva_seccion, orden)
# Si la seccion vieja era 'nosotros', usamos este mapping para decidir nueva seccion.
NOSOTROS_KEY_TO_SECCION = {
    'titulo':           ('hero',          10),
    'subtitulo':        ('hero',          20),
    'stat_anos':        ('hero',          30),
    'stat_vendidas':    ('hero',          40),
    'stat_proyectos':   ('hero',          50),
    'stat_entregadas':  ('hero',          60),
    'mision':           ('mision_vision', 10),
    'vision':           ('mision_vision', 20),
    'propuesta_valor':  ('mision_vision', 30),
    'valores':          ('valores',       10),
    # 'historia' se mueve a pagina=inicio, seccion=quienes_somos (caso especial abajo).
}

# Para seccion=hero del Home.
HERO_KEY_ORDEN = {
    'titulo':                10,
    'subtitulo':             20,
    'cta_texto':             30,
    'indicador_anos':        40,
    'indicador_vendidas':    50,
    'indicador_entregadas':  60,
}

# Para seccion=contacto.
CONTACTO_KEY_ORDEN = {
    'direccion':       10,
    'telefono':        20,
    'email':           30,
    'horario':         40,
    'whatsapp':        50,
    'google_maps_url': 60,
}

# Para seccion=footer.
FOOTER_KEY_ORDEN = {
    'dominio':  10,
    'slogan':   20,
    'whatsapp': 30,
    'facebook': 40,
}


def forwards(apps, schema_editor):
    ContenidoWeb = apps.get_model('content', 'ContenidoWeb')

    for c in ContenidoWeb.objects.all():
        old_seccion = c.seccion

        if old_seccion == 'hero':
            c.pagina = 'inicio'
            c.seccion = 'hero'
            c.orden = HERO_KEY_ORDEN.get(c.clave, 99)

        elif old_seccion == 'nosotros':
            # Caso especial: la `historia` se usa en el Home (AboutPreview).
            if c.clave == 'historia':
                c.pagina = 'inicio'
                c.seccion = 'quienes_somos'
                c.orden = 10
            else:
                c.pagina = 'nosotros'
                new_seccion, orden = NOSOTROS_KEY_TO_SECCION.get(c.clave, ('hero', 99))
                c.seccion = new_seccion
                c.orden = orden

        elif old_seccion == 'contacto':
            c.pagina = 'contacto'
            c.seccion = 'info_contacto'
            c.orden = CONTACTO_KEY_ORDEN.get(c.clave, 99)

        elif old_seccion == 'footer':
            c.pagina = 'global'
            c.seccion = 'footer'
            c.orden = FOOTER_KEY_ORDEN.get(c.clave, 99)

        else:
            # Default seguro: tirarlo a global/footer asi no se pierde.
            c.pagina = 'global'
            c.seccion = 'footer'
            c.orden = 99

        c.save(update_fields=['pagina', 'seccion', 'orden'])


def backwards(apps, schema_editor):
    """Volver al schema viejo: mapea (pagina, seccion) -> seccion plano."""
    ContenidoWeb = apps.get_model('content', 'ContenidoWeb')

    for c in ContenidoWeb.objects.all():
        if c.pagina == 'inicio' and c.seccion == 'hero':
            c.seccion = 'hero'
        elif c.pagina == 'inicio' and c.seccion == 'quienes_somos':
            # vuelve a 'nosotros' por compatibilidad (de ahi venia)
            c.seccion = 'nosotros'
        elif c.pagina == 'nosotros':
            c.seccion = 'nosotros'
        elif c.pagina == 'contacto':
            c.seccion = 'contacto'
        elif c.pagina == 'global' and c.seccion == 'footer':
            c.seccion = 'footer'
        else:
            c.seccion = 'footer'  # fallback

        c.save(update_fields=['seccion'])


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0008_alter_contenidoweb_options_and_more'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
