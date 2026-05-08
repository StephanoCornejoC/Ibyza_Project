"""
Signals de la app payments.

Single Source of Truth: el estado del Departamento se DERIVA de sus separaciones.

Reglas:
  - Si existe al menos una Separacion con estado='completado' (aprobada) para el
    Departamento, el Departamento queda en 'separado'.
  - Si NO existe ninguna Separacion 'completado' activa, el Departamento vuelve
    a 'disponible' (a menos que esté 'vendido', estado terminal manejado aparte).

Esto se ejecuta en post_save y post_delete de Separacion. El estado del Depto
deja de ser editable desde el admin: cualquier cambio pasa por crear/editar
una Separacion.
"""
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import Separacion


def _recalcular_estado_departamento(depto):
    """Recalcula el estado del Departamento a partir de sus separaciones.

    No toca deptos en estado 'vendido' (estado terminal de venta cerrada).
    """
    if depto is None:
        return
    if depto.estado == 'vendido':
        return

    tiene_aprobada = Separacion.objects.filter(
        departamento=depto, estado='completado',
    ).exists()

    nuevo_estado = 'separado' if tiene_aprobada else 'disponible'
    if depto.estado != nuevo_estado:
        depto.estado = nuevo_estado
        depto.save(update_fields=['estado'])


@receiver(post_save, sender=Separacion)
def sincronizar_estado_departamento(sender, instance, **kwargs):
    """post_save de Separacion → recalcula estado del Depto asociado."""
    _recalcular_estado_departamento(instance.departamento)


@receiver(post_delete, sender=Separacion)
def sincronizar_al_borrar(sender, instance, **kwargs):
    """Si borran una separación, recalcular estado del Depto."""
    _recalcular_estado_departamento(instance.departamento)
