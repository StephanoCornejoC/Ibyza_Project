"""
Signals de la app content.

1. Compresión server-side de imágenes (pre_save):
   Antes de persistir, las imágenes que sube Diana se comprimen a WebP
   y se redimensionan a un ancho máximo razonable.

2. Invalidación de cache (post_save / post_delete):
   Cuando Diana edita ConfiguracionSitio, ContenidoWeb, Testimonio, FAQ
   o Beneficio desde el admin, las views con cache_page siguen sirviendo
   respuesta vieja hasta que expira el TTL. Al limpiar el cache aquí,
   los cambios se ven en el sitio en menos de 1 segundo.
"""
from django.core.cache import cache
from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver

from projects.signals import _detect_changed_image_fields
from projects.utils import compress_image_field

from .models import (
    Beneficio,
    ConfiguracionSitio,
    ContenidoWeb,
    PreguntaFrecuente,
    Testimonio,
)


# ─── Compresión de imágenes ─────────────────────────────────────────────────

@receiver(pre_save, sender=Testimonio)
def compress_testimonio_images(sender, instance, **kwargs):
    for f in _detect_changed_image_fields(instance, ['foto']):
        compress_image_field(getattr(instance, f))


@receiver(pre_save, sender=ContenidoWeb)
def compress_contenidoweb_images(sender, instance, **kwargs):
    for f in _detect_changed_image_fields(instance, ['imagen']):
        compress_image_field(getattr(instance, f))


@receiver(pre_save, sender=ConfiguracionSitio)
def compress_configuracion_images(sender, instance, **kwargs):
    for f in _detect_changed_image_fields(instance, ['modal_imagen']):
        compress_image_field(getattr(instance, f))


# ─── Invalidación de cache ──────────────────────────────────────────────────

def _invalidar_cache_contenido(sender, instance, **kwargs):
    """Limpia el cache. Como cache_page indexa por URL completa, lo más
    seguro es invalidar todo el backend cache."""
    cache.clear()


post_save.connect(_invalidar_cache_contenido, sender=ConfiguracionSitio)
post_save.connect(_invalidar_cache_contenido, sender=ContenidoWeb)
post_delete.connect(_invalidar_cache_contenido, sender=ContenidoWeb)
post_save.connect(_invalidar_cache_contenido, sender=Testimonio)
post_delete.connect(_invalidar_cache_contenido, sender=Testimonio)
post_save.connect(_invalidar_cache_contenido, sender=PreguntaFrecuente)
post_delete.connect(_invalidar_cache_contenido, sender=PreguntaFrecuente)
post_save.connect(_invalidar_cache_contenido, sender=Beneficio)
post_delete.connect(_invalidar_cache_contenido, sender=Beneficio)
