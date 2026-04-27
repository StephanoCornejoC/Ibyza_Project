from rest_framework import generics
from django_filters.rest_framework import DjangoFilterBackend
from .models import Proyecto, Departamento, AvanceDeObra
from .serializers import (
    ProyectoListSerializer, ProyectoDetailSerializer,
    DepartamentoSerializer, DepartamentoDisponibleSerializer, AvanceSerializer,
)


class ProyectoListView(generics.ListAPIView):
    serializer_class = ProyectoListSerializer
    queryset = Proyecto.objects.filter(activo=True)


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


class AvancesView(generics.ListAPIView):
    serializer_class = AvanceSerializer

    def get_queryset(self):
        return AvanceDeObra.objects.filter(
            proyecto__slug=self.kwargs['slug'],
            publicado=True,
        )


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
