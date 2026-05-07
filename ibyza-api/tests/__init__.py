"""
Hooks globales de la suite de tests:

1) Bloqueo global de envios reales a Resend.
   El .env de desarrollo puede contener RESEND_API_KEY real. Sin este patch,
   cualquier test que dispare un endpoint con side-effect de email (POST a
   /api/contacto/, /api/contacto/citas/, etc.) consumiria cuota mensual.
   Tests que necesitan inspeccionar el envio (test_email_integration.py,
   test_solicitud_cita_email_cliente.py) hacen patch.start() propio sobre el
   mismo target — eso se apila por encima y funciona sin cambios.

2) Limpieza global de LocMemCache cuando CACHES cambia via override_settings.
   LocMemCache usa un dict de modulo (_caches, _expire_info en
   django.core.cache.backends.locmem) compartido entre todas las instancias
   que usan la misma LOCATION. Tests con `@override_settings(CACHES=...)` a
   nivel METODO no incluyen setUp en el scope, asi que el cache.clear() del
   setUp limpia la cache externa (no la del override). Resultado: contadores
   de DRF AnonRateThrottle se acumulan entre tests con override de metodo.
   Hook al setting_changed para limpiar ese dict cada vez que CACHES cambia.

Este __init__.py se ejecuta automaticamente cuando Django descubre el paquete
`tests/`, antes de importar cualquier test_*.py.
"""
import atexit
from unittest.mock import patch

from django.core.signals import setting_changed
from django.dispatch import receiver

_resend_patcher = patch('resend.Emails.send', return_value={'id': 'test-mock-id'})
_resend_patcher.start()
atexit.register(_resend_patcher.stop)


@receiver(setting_changed)
def _clear_locmem_storage_on_caches_change(*, setting, **kwargs):
    """Cuando un test override CACHES, vacia el storage de LocMemCache.

    Esto asegura que cada `@override_settings(CACHES={LocMemCache, ...})` arranque
    con cache vacia, sin contadores de throttle ni respuestas cacheadas
    heredadas de tests anteriores (LocMemCache comparte storage por modulo).
    """
    if setting != 'CACHES':
        return
    try:
        from django.core.cache.backends import locmem
    except ImportError:
        return
    locmem._caches.clear()
    locmem._expire_info.clear()
    locmem._locks.clear()
