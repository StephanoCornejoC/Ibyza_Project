from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from .models import ContenidoWeb, ConfiguracionSitio, Beneficio
from .serializers import (
    ContenidoWebSerializer,
    ConfiguracionSitioSerializer,
    BeneficioSerializer,
)


class ContenidoWebView(generics.ListAPIView):
    """GET /api/contenido/?pagina=inicio&seccion=hero

    Ambos query params son opcionales y se combinan con AND.
    Si no se manda nada, devuelve todos los entries activos.
    """
    serializer_class = ContenidoWebSerializer

    def get_queryset(self):
        qs = ContenidoWeb.objects.filter(activo=True)
        pagina = self.request.query_params.get('pagina')
        seccion = self.request.query_params.get('seccion')
        if pagina:
            qs = qs.filter(pagina=pagina)
        if seccion:
            qs = qs.filter(seccion=seccion)
        return qs.order_by('pagina', 'seccion', 'orden', 'clave')


@method_decorator(cache_page(30), name='dispatch')
class ConfiguracionSitioView(APIView):
    """GET /api/configuracion/ — Devuelve la configuración global del sitio."""
    def get(self, request):
        config = ConfiguracionSitio.get_solo()
        serializer = ConfiguracionSitioSerializer(config)
        return Response(serializer.data)


@method_decorator(cache_page(30), name='dispatch')
class BeneficiosView(generics.ListAPIView):
    """GET /api/beneficios/ — Lista de beneficios publicados."""
    serializer_class = BeneficioSerializer
    queryset = Beneficio.objects.filter(activo=True)
    pagination_class = None
