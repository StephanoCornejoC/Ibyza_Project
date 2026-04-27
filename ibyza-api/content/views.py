from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import ContenidoWeb, ConfiguracionSitio, PreguntaFrecuente, Testimonio, Beneficio
from .serializers import (
    ContenidoWebSerializer,
    ConfiguracionSitioSerializer,
    PreguntaFrecuenteSerializer,
    TestimonioSerializer,
    BeneficioSerializer,
)


class ContenidoWebView(generics.ListAPIView):
    """GET /api/contenido/?seccion=hero"""
    serializer_class = ContenidoWebSerializer

    def get_queryset(self):
        qs = ContenidoWeb.objects.filter(activo=True)
        seccion = self.request.query_params.get('seccion')
        if seccion:
            qs = qs.filter(seccion=seccion)
        return qs


class ConfiguracionSitioView(APIView):
    """GET /api/configuracion/ — Devuelve la configuración global del sitio."""
    def get(self, request):
        config = ConfiguracionSitio.get_solo()
        serializer = ConfiguracionSitioSerializer(config)
        return Response(serializer.data)


class PreguntasFrecuentesView(generics.ListAPIView):
    """GET /api/faq/ — Lista de preguntas frecuentes publicadas."""
    serializer_class = PreguntaFrecuenteSerializer
    queryset = PreguntaFrecuente.objects.filter(activo=True)
    pagination_class = None


class TestimoniosView(generics.ListAPIView):
    """GET /api/testimonios/ — Lista de testimonios publicados."""
    serializer_class = TestimonioSerializer
    queryset = Testimonio.objects.filter(activo=True).select_related('proyecto')
    pagination_class = None


class BeneficiosView(generics.ListAPIView):
    """GET /api/beneficios/ — Lista de beneficios publicados."""
    serializer_class = BeneficioSerializer
    queryset = Beneficio.objects.filter(activo=True)
    pagination_class = None
