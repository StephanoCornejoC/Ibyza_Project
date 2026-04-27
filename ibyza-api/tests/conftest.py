"""
Configuracion compartida de tests para IBYZA API.

Fixtures reutilizables para todas las apps.
"""
import os
import django
from decimal import Decimal
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ibyza.settings')
django.setup()

from django.test import TestCase
from django.utils import timezone
from projects.models import Proyecto, Nivel, Departamento, AvanceDeObra, VideoProyecto, ImagenGaleria
from contact.models import SolicitudContacto, SolicitudCita
from payments.models import Separacion
from content.models import ContenidoWeb


class BaseTestData:
    """Mixin con helpers para crear datos de prueba."""

    @staticmethod
    def crear_proyecto(**kwargs):
        defaults = {
            'nombre': 'Proyecto Test',
            'descripcion_corta': 'Descripcion corta de prueba',
            'descripcion': 'Descripcion completa de prueba para el proyecto test.',
            'ubicacion': 'Calle Test 123, Arequipa',
            'estado': 'en_venta',
            'precio_desde': Decimal('180000.00'),
            'orden': 1,
            'activo': True,
        }
        defaults.update(kwargs)
        return Proyecto.objects.create(**defaults)

    @staticmethod
    def crear_nivel(proyecto, **kwargs):
        defaults = {
            'proyecto': proyecto,
            'numero': 1,
            'nombre': 'Piso 1',
            'orden': 1,
        }
        defaults.update(kwargs)
        return Nivel.objects.create(**defaults)

    @staticmethod
    def crear_departamento(nivel, **kwargs):
        defaults = {
            'nivel': nivel,
            'codigo': '101',
            'tipo': '2dorm',
            'area_total': Decimal('75.50'),
            'area_techada': Decimal('65.00'),
            'precio': Decimal('200000.00'),
            'estado': 'disponible',
        }
        defaults.update(kwargs)
        return Departamento.objects.create(**defaults)

    @staticmethod
    def crear_avance(proyecto, **kwargs):
        defaults = {
            'proyecto': proyecto,
            'titulo': 'Avance Test',
            'contenido': 'Contenido del avance de obra.',
            'fecha': timezone.now().date(),
            'publicado': True,
        }
        defaults.update(kwargs)
        return AvanceDeObra.objects.create(**defaults)

    @staticmethod
    def crear_contenido_web(**kwargs):
        defaults = {
            'seccion': 'hero',
            'clave': 'titulo',
            'valor': 'Texto de prueba',
            'activo': True,
        }
        defaults.update(kwargs)
        return ContenidoWeb.objects.create(**defaults)

    @staticmethod
    def datos_contacto(**kwargs):
        defaults = {
            'nombre': 'Juan',
            'apellido': 'Perez',
            'email': 'juan@test.com',
            'telefono': '987654321',
            'mensaje': 'Quiero informacion sobre el proyecto.',
        }
        defaults.update(kwargs)
        return defaults

    @staticmethod
    def datos_cita(**kwargs):
        defaults = {
            'nombre': 'Maria',
            'apellido': 'Lopez',
            'email': 'maria@test.com',
            'telefono': '912345678',
            'tipo': 'presencial',
            'fecha_preferida': (timezone.now() + timedelta(days=3)).isoformat(),
        }
        defaults.update(kwargs)
        return defaults

    @staticmethod
    def datos_separacion(departamento_id, **kwargs):
        defaults = {
            'departamento': departamento_id,
            'nombre': 'Carlos',
            'apellido': 'Garcia',
            'email': 'carlos@test.com',
            'telefono': '998877665',
            'dni': '12345678',
            'monto': '1000.00',
            'culqi_token': 'tkn_test_valid_token_123',
        }
        defaults.update(kwargs)
        return defaults
