from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django_filters.rest_framework import DjangoFilterBackend
from .models import Proyecto, Departamento, AvanceDeObra
from .serializers import (
    ProyectoListSerializer, ProyectoDetailSerializer,
    DepartamentoSerializer, DepartamentoDisponibleSerializer, AvanceSerializer,
    DatosBancariosSerializer,
)


@method_decorator(cache_page(30), name='dispatch')
class ProyectoListView(generics.ListAPIView):
    serializer_class = ProyectoListSerializer
    queryset = Proyecto.objects.filter(activo=True)


@method_decorator(cache_page(30), name='dispatch')
class ProyectoDetailView(generics.RetrieveAPIView):
    serializer_class = ProyectoDetailSerializer
    lookup_field = 'slug'
    queryset = Proyecto.objects.filter(activo=True).prefetch_related(
        'niveles__departamentos', 'avances', 'videos', 'galeria'
    )


class DepartamentosView(generics.ListAPIView):
    serializer_class = DepartamentoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['estado', 'tipo']

    def get_queryset(self):
        return Departamento.objects.filter(
            nivel__proyecto__slug=self.kwargs['slug'],
            nivel__proyecto__activo=True,
        )


@method_decorator(cache_page(30), name='dispatch')
class AvancesView(generics.ListAPIView):
    serializer_class = AvanceSerializer

    def get_queryset(self):
        return AvanceDeObra.objects.filter(
            proyecto__slug=self.kwargs['slug'],
            publicado=True,
        )


@method_decorator(cache_page(30), name='dispatch')
class DepartamentosDisponiblesView(generics.ListAPIView):
    """
    GET /api/departamentos/disponibles/
    Lista TODOS los departamentos con estado='disponible' de todos los proyectos activos.
    Incluye info del proyecto para poder abrir el modal de separacion directamente.
    """
    serializer_class = DepartamentoDisponibleSerializer
    pagination_class = None

    def get_queryset(self):
        return (
            Departamento.objects
            .filter(
                estado='disponible',
                nivel__proyecto__activo=True,
            )
            .select_related('nivel__proyecto')
            .order_by('nivel__proyecto__orden', 'nivel__numero', 'codigo')
        )


class DatosBancariosThrottle(AnonRateThrottle):
    """Throttle agresivo para evitar scraping de datos bancarios."""
    scope = 'datos_bancarios'


class DatosBancariosView(APIView):
    """
    POST /api/proyectos/<slug>/datos-bancarios/

    Devuelve los datos bancarios de la empresa receptora del proyecto
    SOLO cuando el comprador envia sus datos minimos. No persiste nada por
    ahora (pendiente: lead capture en sprint posterior). Esta detras de un
    throttle agresivo (5/min/IP) para frenar scraping.

    Body requerido: {"nombre": str, "email": str}
    """
    permission_classes = []
    throttle_classes = [DatosBancariosThrottle]

    def post(self, request, slug):
        nombre = (request.data.get('nombre') or '').strip()
        email = (request.data.get('email') or '').strip()
        if not nombre or not email:
            return Response(
                {'detail': 'Se requieren los campos "nombre" y "email" para acceder a los datos bancarios.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        proyecto = get_object_or_404(Proyecto, slug=slug, activo=True)
        return Response(DatosBancariosSerializer(proyecto).data)
