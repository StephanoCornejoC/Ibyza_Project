from rest_framework import serializers
from .models import ContenidoWeb, ConfiguracionSitio, Beneficio


class ContenidoWebSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContenidoWeb
        fields = ['pagina', 'seccion', 'clave', 'valor', 'imagen', 'orden']


class ConfiguracionSitioSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfiguracionSitio
        exclude = ['id']


class BeneficioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Beneficio
        fields = ['id', 'titulo', 'descripcion', 'imagen', 'icono', 'orden']
