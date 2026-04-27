import re
from django.utils import timezone
from rest_framework import serializers
from .models import SolicitudContacto, SolicitudCita


class TelefonoValidatorMixin:
    """Validacion reutilizable para campo telefono."""

    def validate_telefono(self, value):
        cleaned = re.sub(r'[\s\-\+\(\)]', '', value)
        if not re.match(r'^\d{7,15}$', cleaned):
            raise serializers.ValidationError(
                'El telefono debe contener entre 7 y 15 digitos.'
            )
        return value


class SolicitudContactoSerializer(TelefonoValidatorMixin, serializers.ModelSerializer):
    class Meta:
        model = SolicitudContacto
        fields = ['nombre', 'apellido', 'email', 'telefono', 'proyecto_interes', 'mensaje']

    def validate_mensaje(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('El mensaje no puede estar vacio.')
        if len(value) > 5000:
            raise serializers.ValidationError('El mensaje no debe exceder 5000 caracteres.')
        return value.strip()


class SolicitudCitaSerializer(TelefonoValidatorMixin, serializers.ModelSerializer):
    class Meta:
        model = SolicitudCita
        fields = ['nombre', 'apellido', 'email', 'telefono', 'tipo', 'fecha_preferida', 'mensaje']

    def validate_fecha_preferida(self, value):
        if value < timezone.now():
            raise serializers.ValidationError(
                'La fecha preferida no puede ser en el pasado.'
            )
        return value
