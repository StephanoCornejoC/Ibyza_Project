"""
Signals para invalidar cache cuando se edita contenido del sitio.

Cuando Diana edita ConfiguracionSitio, ContenidoWeb, Testimonio, FAQ o
Beneficio desde el admin, las views con cache_page siguen sirviendo
respuesta vieja hasta que expira el TTL (600s). Al limpiar el cache aca,
los cambios se ven en el sitio en menos de 1 segundo.
"""
from django.core.cache import cache
from django.db.models.signals import post_save, post_delete

from .models import (
    Beneficio,
    ConfiguracionSitio,
    ContenidoWeb,
    PreguntaFrecuente,
    Testimonio,
)


def _invalidar_cache_contenido(sender, instance, **kwargs):
    """Limpia el cache. Como cache_page indexa por URL completa, lo mas
    seguro es invalidar todo el backend cache."""
    cache.clear()


# Conectamos signals para los modelos que afectan la vista publica.
post_save.connect(_invalidar_cache_contenido, sender=ConfiguracionSitio)
post_save.connect(_invalidar_cache_contenido, sender=ContenidoWeb)
post_delete.connect(_invalidar_cache_contenido, sender=ContenidoWeb)
post_save.connect(_invalidar_cache_contenido, sender=Testimonio)
post_delete.connect(_invalidar_cache_contenido, sender=Testimonio)
post_save.connect(_invalidar_cache_contenido, sender=PreguntaFrecuente)
post_delete.connect(_invalidar_cache_contenido, sender=PreguntaFrecuente)
post_save.connect(_invalidar_cache_contenido, sender=Beneficio)
post_delete.connect(_invalidar_cache_contenido, sender=Beneficio)
