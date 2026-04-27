from rest_framework import serializers
from .models import ContenidoWeb, ConfiguracionSitio, PreguntaFrecuente, Testimonio, Beneficio


class ContenidoWebSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContenidoWeb
        fields = ['seccion', 'clave', 'valor', 'imagen']


class ConfiguracionSitioSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfiguracionSitio
        exclude = ['id']


class PreguntaFrecuenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreguntaFrecuente
        fields = ['id', 'pregunta', 'respuesta', 'orden']


class TestimonioSerializer(serializers.ModelSerializer):
    proyecto_nombre = serializers.CharField(source='proyecto.nombre', read_only=True, default='')

    class Meta:
        model = Testimonio
        fields = ['id', 'nombre', 'cargo', 'proyecto_nombre', 'testimonio', 'foto', 'calificacion', 'orden']


class BeneficioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Beneficio
        fields = ['id', 'titulo', 'descripcion', 'icono', 'orden']
