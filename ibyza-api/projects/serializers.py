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
                  'niveles', 'avances', 'videos', 'galeria']


class AvanceCompradorSerializer(serializers.Serializer):
    """Serializer del endpoint público por código de acceso del comprador.

    Recibe un dict con keys: proyecto, departamento, avances.
    """
    proyecto = serializers.SerializerMethodField()
    departamento = serializers.SerializerMethodField()
    avances = AvanceSerializer(many=True, read_only=True)

    def get_proyecto(self, obj):
        p = obj['proyecto']
        request = self.context.get('request') if hasattr(self, 'context') else None
        fachada = p.imagen_fachada.url if p.imagen_fachada else None
        if fachada and request:
            fachada = request.build_absolute_uri(fachada)
        return {
            'nombre': p.nombre,
            'slug': p.slug,
            'ubicacion': p.ubicacion,
            'imagen_fachada': fachada,
            'estado': p.estado,
            'estado_display': p.get_estado_display(),
        }

    def get_departamento(self, obj):
        d = obj['departamento']
        return {
            'codigo': d.codigo,
            'tipo': d.tipo,
            'tipo_display': d.get_tipo_display(),
            'area_total': str(d.area_total),
            'area_techada': str(d.area_techada),
            'piso': d.nivel.numero if d.nivel else None,
        }


class DatosBancariosSerializer(serializers.ModelSerializer):
    """Datos bancarios de la empresa receptora del proyecto.

    NUNCA exponer este serializer en endpoints abiertos (listado, detalle).
    Solo se entrega tras un POST con datos del comprador (nombre, email)
    al endpoint /api/proyectos/<slug>/datos-bancarios/, con throttle agresivo.
    """

    class Meta:
        model = Proyecto
        fields = ['empresa_receptora', 'empresa_ruc', 'empresa_banco',
                  'cuenta_soles', 'cci_soles', 'cuenta_dolares', 'cci_dolares']
