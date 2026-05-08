"""
Signals para invalidar cache cuando se edita contenido publico.

Cuando Diana edita un Proyecto, ImagenGaleria, AvanceDeObra o VideoProyecto
desde el admin, las views con cache_page siguen sirviendo respuesta vieja
hasta que expira el TTL (600s). Al limpiar el cache aca, los cambios se
ven en el sitio en menos de 1 segundo.
"""
from django.core.cache import cache
from django.db.models.signals import post_save, post_delete

from .models import (
    AvanceDeObra,
    Departamento,
    ImagenGaleria,
    Proyecto,
    VideoProyecto,
)


def _invalidar_cache_proyectos(sender, instance, **kwargs):
    """Limpia el cache. Como cache_page indexa por URL completa, lo mas
    seguro es invalidar todo el backend cache."""
    cache.clear()


# Conectamos signals para los modelos que afectan la vista publica.
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
