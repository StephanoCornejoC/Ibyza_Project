"""Data migration: alinea los entries de ContenidoWeb con lo que el frontend
realmente consume. Elimina entries huerfanos (que el front no lee) y agrega
los faltantes para que Diana pueda editar imagenes y textos del Hero.

Cambios:

ELIMINAR:
- inicio/hero: subtitulo, cta_texto, indicador_anos, indicador_vendidas,
  indicador_entregadas
  (el componente HeroSection del Home NO los renderiza — solo lee `titulo` y
   `imagen_fondo`).
- global/footer: TODOS (dominio, slogan, whatsapp, facebook).
  (el footer real consume `ConfiguracionSitio`, no ContenidoWeb.)

CREAR (con valor vacio para que Diana suba/escriba):
- inicio/hero/imagen_fondo (image-only, sin texto)
- inicio/quienes_somos/imagen_nosotros (image-only)
- nosotros/hero/titulo (default: "Quiénes somos")
- nosotros/hero/subtitulo (default: "Una empresa comprometida con la calidad,
  la transparencia y el bienestar de nuestros clientes.")
- nosotros/hero/imagen_hero (image-only)

Convencion de claves: los entries de imagen usan la clave que el componente
del frontend ya espera leer (e.g. `imagen_fondo`, `imagen_hero`). El campo
`valor` queda vacio, el campo `imagen` se completa con el archivo cuando
Diana suba uno.
"""
from django.db import migrations


CLAVES_A_ELIMINAR_INICIO_HERO = [
    'subtitulo',
    'cta_texto',
    'indicador_anos',
    'indicador_vendidas',
    'indicador_entregadas',
]


# (pagina, seccion, clave, valor_default, orden)
ENTRIES_NUEVOS = [
    ('inicio',   'hero',           'imagen_fondo',     '', 90),
    ('inicio',   'quienes_somos',  'imagen_nosotros',  '', 90),
    ('nosotros', 'hero',           'titulo',           'Quiénes somos', 10),
    ('nosotros', 'hero',           'subtitulo',
        'Una empresa comprometida con la calidad, la transparencia y el bienestar de nuestros clientes.', 20),
    ('nosotros', 'hero',           'imagen_hero',      '', 25),
]


def forwards(apps, schema_editor):
    ContenidoWeb = apps.get_model('content', 'ContenidoWeb')

    # 1. Eliminar entries que el frontend NO lee.
    qs_huerfanos_inicio = ContenidoWeb.objects.filter(
        pagina='inicio', seccion='hero', clave__in=CLAVES_A_ELIMINAR_INICIO_HERO,
    )
    n1 = qs_huerfanos_inicio.count()
    qs_huerfanos_inicio.delete()

    qs_huerfanos_global = ContenidoWeb.objects.filter(pagina='global', seccion='footer')
    n2 = qs_huerfanos_global.count()
    qs_huerfanos_global.delete()

    print(f'  [+] eliminados {n1} entries huerfanos de inicio/hero')
    print(f'  [+] eliminados {n2} entries huerfanos de global/footer')

    # 2. Crear entries faltantes (idempotente con get_or_create por (pagina, seccion, clave)).
    creados = 0
    for pagina, seccion, clave, valor, orden in ENTRIES_NUEVOS:
        obj, created = ContenidoWeb.objects.get_or_create(
            pagina=pagina, seccion=seccion, clave=clave,
            defaults={
                'valor': valor,
                'orden': orden,
                'activo': True,
            },
        )
        if created:
            creados += 1

    print(f'  [+] creados {creados} entries faltantes')


def backwards(apps, schema_editor):
    """No restauramos los entries huerfanos (eran data muerta); solo borramos
    los que esta migracion creo."""
    ContenidoWeb = apps.get_model('content', 'ContenidoWeb')

    for pagina, seccion, clave, _, _ in ENTRIES_NUEVOS:
        ContenidoWeb.objects.filter(pagina=pagina, seccion=seccion, clave=clave).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0012_delete_preguntafrecuente_delete_testimonio'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
