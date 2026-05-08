"""
Signals de la app projects.

1. Compresión server-side de imágenes (pre_save):
   Antes de persistir, las imágenes que sube Diana se comprimen a WebP
   y se redimensionan a un ancho máximo razonable. Esto reduce drásticamente
   el uso de storage en R2 y el peso que ve el visitante.

2. Invalidación de cache (post_save / post_delete):
   Cuando Diana edita contenido público las views con cache_page siguen
   sirviendo respuesta vieja hasta que expira el TTL (600s). Al limpiar
   el cache aquí, los cambios se ven en el sitio en menos de 1 segundo.
"""
from django.core.cache import cache
from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver

from .models import (
    AvanceDeObra,
    Departamento,
    ImagenGaleria,
    Nivel,
    Proyecto,
    VideoProyecto,
)
from .utils import compress_image_field


# ─── Compresión de imágenes ────────────────────────────────────────────────

def _detect_changed_image_fields(instance, fields):
    """Devuelve la lista de fields cuya imagen cambió respecto a la
    versión persistida en DB.

    Si el modelo es nuevo (sin pk), todos los fields con imagen cuentan.
    Para evitar comparar objetos FieldFile (que comparan por identidad),
    comparamos por `.name` (la ruta dentro del storage).
    """
    if not instance.pk:
        return [f for f in fields if getattr(instance, f)]

    try:
        old = type(instance).objects.get(pk=instance.pk)
    except type(instance).DoesNotExist:
        return [f for f in fields if getattr(instance, f)]

    changed = []
    for f in fields:
        old_val = getattr(old, f)
        new_val = getattr(instance, f)
        old_name = old_val.name if old_val else None
        new_name = new_val.name if new_val else None
        if old_name != new_name and new_val:
            changed.append(f)
    return changed


@receiver(pre_save, sender=Proyecto)
def compress_proyecto_images(sender, instance, **kwargs):
    fields = ['imagen_fachada', 'imagen_isometrico']
    for f in _detect_changed_image_fields(instance, fields):
        compress_image_field(getattr(instance, f))


@receiver(pre_save, sender=Nivel)
def compress_nivel_images(sender, instance, **kwargs):
    for f in _detect_changed_image_fields(instance, ['imagen_planta']):
        compress_image_field(getattr(instance, f))


@receiver(pre_save, sender=Departamento)
def compress_depto_images(sender, instance, **kwargs):
    for f in _detect_changed_image_fields(instance, ['imagen_planta']):
        compress_image_field(getattr(instance, f))


@receiver(pre_save, sender=AvanceDeObra)
def compress_avance_images(sender, instance, **kwargs):
    for f in _detect_changed_image_fields(instance, ['imagen']):
        compress_image_field(getattr(instance, f))


@receiver(pre_save, sender=ImagenGaleria)
def compress_galeria_images(sender, instance, **kwargs):
    for f in _detect_changed_image_fields(instance, ['imagen']):
        compress_image_field(getattr(instance, f))


# ─── Invalidación de cache ──────────────────────────────────────────────────

def _invalidar_cache_proyectos(sender, instance, **kwargs):
    """Limpia el cache. Como cache_page indexa por URL completa, lo más
    seguro es invalidar todo el backend cache."""
    cache.clear()


post_save.connect(_invalidar_cache_proyectos, sender=Proyecto)
post_delete.connect(_invalidar_cache_proyectos, sender=Proyecto)
post_save.connect(_invalidar_cache_proyectos, sender=ImagenGaleria)
post_delete.connect(_invalidar_cache_proyectos, sender=ImagenGaleria)
post_save.connect(_invalidar_cache_proyectos, sender=AvanceDeObra)
post_delete.connect(_invalidar_cache_proyectos, sender=AvanceDeObra)
post_save.connect(_invalidar_cache_proyectos, sender=VideoProyecto)
post_delete.connect(_invalidar_cache_proyectos, sender=VideoProyecto)
post_save.connect(_invalidar_cache_proyectos, sender=Departamento)
post_delete.connect(_invalidar_cache_proyectos, sender=Departamento)
