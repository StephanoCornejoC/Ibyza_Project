from django.http import JsonResponse


def healthz(request):
    """Healthcheck barato para Railway: no toca DB, devuelve 200 OK constante.

    Reemplaza al chequeo previo contra /admin/ que disparaba un query a la DB
    en cada ping del balanceador.
    """
    return JsonResponse({'status': 'ok'})
