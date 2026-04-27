import re
from decimal import Decimal
from rest_framework import serializers
from .models import Separacion


class _SeparacionBaseValidators:
    """Validadores compartidos entre Culqi y Transferencia."""

    def validate_departamento(self, depto):
        if depto.estado != 'disponible':
            raise serializers.ValidationError('Este departamento ya no esta disponible.')
        return depto

    def validate_dni(self, value):
        if not re.match(r'^\d{8}$', value):
            raise serializers.ValidationError(
                'El DNI debe tener exactamente 8 digitos numericos.'
            )
        return value

    def validate_monto(self, value):
        if value <= Decimal('0'):
            raise serializers.ValidationError('El monto debe ser mayor a cero.')
        if value > Decimal('500000'):
            raise serializers.ValidationError('El monto excede el limite permitido.')
        return value

    def validate_telefono(self, value):
        cleaned = re.sub(r'[\s\-\+\(\)]', '', value)
        if not re.match(r'^\d{7,15}$', cleaned):
            raise serializers.ValidationError(
                'El telefono debe contener entre 7 y 15 digitos.'
            )
        return value


class SeparacionSerializer(_SeparacionBaseValidators, serializers.ModelSerializer):
    """Serializer para pago con Culqi (tarjeta)."""
    culqi_token = serializers.CharField(write_only=True, max_length=200)

    class Meta:
        model = Separacion
        fields = ['departamento', 'nombre', 'apellido', 'email', 'telefono', 'dni', 'monto', 'culqi_token']

    def validate_culqi_token(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('El token de pago es requerido.')
        return value.strip()


class SeparacionTransferenciaSerializer(_SeparacionBaseValidators, serializers.ModelSerializer):
    """Serializer para pago por transferencia bancaria (comprobante imagen)."""

    class Meta:
        model = Separacion
        fields = ['departamento', 'nombre', 'apellido', 'email', 'telefono', 'dni', 'monto', 'comprobante']

    def validate_comprobante(self, value):
        if not value:
            raise serializers.ValidationError('El comprobante de transferencia es requerido.')
        max_size = 10 * 1024 * 1024  # 10 MB
        if value.size > max_size:
            raise serializers.ValidationError('El archivo no debe exceder 10 MB.')
        allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
        if value.content_type not in allowed:
            raise serializers.ValidationError(
                'Solo se permiten archivos JPEG, PNG, WebP o PDF.'
            )
        return value
