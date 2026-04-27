from rest_framework import serializers
from .models import Proyecto, Nivel, Departamento, AvanceDeObra, VideoProyecto, ImagenGaleria


class DepartamentoSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)

    class Meta:
        model = Departamento
        fields = ['id', 'codigo', 'tipo', 'tipo_display', 'area_total', 'area_techada',
                  'precio', 'estado', 'estado_display', 'descripcion', 'imagen_planta']


class DepartamentoDisponibleSerializer(serializers.ModelSerializer):
    """Serializer para listado global de deptos disponibles con info del proyecto."""
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    nivel_numero = serializers.IntegerField(source='nivel.numero', read_only=True)
    nivel_nombre = serializers.CharField(source='nivel.nombre', read_only=True)
    proyecto = serializers.SerializerMethodField()

    class Meta:
        model = Departamento
        fields = ['id', 'codigo', 'tipo', 'tipo_display', 'area_total', 'area_techada',
                  'precio', 'estado', 'estado_display', 'descripcion', 'imagen_planta',
                  'nivel_numero', 'nivel_nombre', 'proyecto']

    def get_proyecto(self, obj):
        p = obj.nivel.proyecto
        request = self.context.get('request')
        fachada = p.imagen_fachada.url if p.imagen_fachada else None
        if fachada and request:
            fachada = request.build_absolute_uri(fachada)
        return {
            'id': p.id,
            'nombre': p.nombre,
            'slug': p.slug,
            'ubicacion': p.ubicacion,
            'imagen_fachada': fachada,
            'estado': p.estado,
            'estado_display': p.get_estado_display(),
            # Datos bancarios necesarios para el modal de pago
            'empresa_receptora': p.empresa_receptora,
            'empresa_ruc': p.empresa_ruc,
            'empresa_banco': p.empresa_banco,
            'cuenta_soles': p.cuenta_soles,
            'cci_soles': p.cci_soles,
            'cuenta_dolares': p.cuenta_dolares,
            'cci_dolares': p.cci_dolares,
        }


class NivelSerializer(serializers.ModelSerializer):
    departamentos = DepartamentoSerializer(many=True, read_only=True)

    class Meta:
        model = Nivel
        fields = ['id', 'numero', 'nombre', 'imagen_planta', 'departamentos']


class AvanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvanceDeObra
        fields = ['id', 'titulo', 'contenido', 'imagen', 'fecha']


class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoProyecto
        fields = ['id', 'titulo', 'youtube_url', 'orden']


class ImagenGaleriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagenGaleria
        fields = ['id', 'imagen', 'descripcion', 'orden']


class ProyectoListSerializer(serializers.ModelSerializer):
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)

    class Meta:
        model = Proyecto
        fields = ['id', 'nombre', 'slug', 'descripcion_corta', 'ubicacion',
                  'imagen_fachada', 'estado', 'estado_display', 'precio_desde']


class ProyectoDetailSerializer(serializers.ModelSerializer):
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    niveles = NivelSerializer(many=True, read_only=True)
    avances = AvanceSerializer(many=True, read_only=True)
    videos = VideoSerializer(many=True, read_only=True)
    galeria = ImagenGaleriaSerializer(many=True, read_only=True)

    class Meta:
        model = Proyecto
        fields = ['id', 'nombre', 'slug', 'descripcion', 'descripcion_corta', 'ubicacion',
                  'google_maps_embed', 'imagen_fachada', 'imagen_isometrico', 'catalogo_pdf',
                  'estado', 'estado_display', 'precio_desde',
                  'empresa_receptora', 'empresa_ruc', 'empresa_banco',
                  'cuenta_soles', 'cci_soles', 'cuenta_dolares', 'cci_dolares',
                  'niveles', 'avances', 'videos', 'galeria']
