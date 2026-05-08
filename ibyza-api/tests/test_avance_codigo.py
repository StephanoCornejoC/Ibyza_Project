"""
Tests del feature "Código de acceso para compradores".

Capa: Unit / API / Service
Tecnicas ISTQB aplicadas:
  - Particion de equivalencia (estado disponible vs separado vs vendido)
  - Transicion de estados (codigo persiste al cambiar de estado)
  - Boundary (throttle exacto en el limite 20/min)
  - Casos negativos (codigo invalido, codigo desactivado)
"""
from unittest.mock import patch

from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from projects.models import Departamento
from tests.conftest import BaseTestData


class CodigoAutogeneracionTest(BaseTestData, TestCase):
    """Tests sobre la auto-generación del código de acceso en save()."""

    def test_codigo_no_se_genera_si_disponible(self):
        """Estado 'disponible' no debe generar código."""
        proyecto = self.crear_proyecto()
        nivel = self.crear_nivel(proyecto)
        depto = self.crear_departamento(nivel, estado='disponible')
        self.assertIsNone(depto.codigo_acceso)

    def test_codigo_se_autogenera_al_marcar_vendido(self):
        """Cuando un depto se guarda como 'vendido', se genera código."""
        proyecto = self.crear_proyecto(nombre='Boreal')
        nivel = self.crear_nivel(proyecto)
        depto = self.crear_departamento(nivel, codigo='901', estado='disponible')
        self.assertIsNone(depto.codigo_acceso)

        depto.estado = 'vendido'
        depto.save()
        depto.refresh_from_db()

        self.assertIsNotNone(depto.codigo_acceso)
        # Formato: SLUG3-CODIGO-RAND4
        partes = depto.codigo_acceso.split('-')
        self.assertEqual(len(partes), 3)
        self.assertEqual(len(partes[0]), 3)  # slug short = 3 chars
        self.assertEqual(partes[1], '901')
        self.assertEqual(len(partes[2]), 4)

    def test_codigo_se_autogenera_al_marcar_separado(self):
        """Estado 'separado' también dispara la generación."""
        proyecto = self.crear_proyecto(nombre='Parke 10')
        nivel = self.crear_nivel(proyecto)
        depto = self.crear_departamento(nivel, codigo='505', estado='separado')
        self.assertIsNotNone(depto.codigo_acceso)

    def test_codigo_no_se_regenera_si_ya_existe(self):
        """Re-guardar un depto con código existente no lo regenera."""
        proyecto = self.crear_proyecto()
        nivel = self.crear_nivel(proyecto)
        depto = self.crear_departamento(nivel, estado='vendido')
        codigo_original = depto.codigo_acceso
        self.assertIsNotNone(codigo_original)

        # Re-save: el código no debe cambiar
        depto.descripcion = 'Algo nuevo'
        depto.save()
        depto.refresh_from_db()
        self.assertEqual(depto.codigo_acceso, codigo_original)

    def test_codigo_unico_no_colisiona(self):
        """Cada depto vendido recibe un código distinto."""
        proyecto = self.crear_proyecto()
        nivel = self.crear_nivel(proyecto)
        codigos = set()
        for i in range(10):
            d = self.crear_departamento(
                nivel, codigo=f'C{i:02d}', estado='vendido',
            )
            self.assertIsNotNone(d.codigo_acceso)
            codigos.add(d.codigo_acceso)
        self.assertEqual(len(codigos), 10, 'Los 10 códigos deben ser únicos')

    def test_codigo_persiste_al_volver_a_disponible(self):
        """Si Diana revierte a disponible, el código existente se mantiene
        (la activación se controla con codigo_activo)."""
        proyecto = self.crear_proyecto()
        nivel = self.crear_nivel(proyecto)
        depto = self.crear_departamento(nivel, estado='vendido')
        codigo = depto.codigo_acceso
        self.assertIsNotNone(codigo)

        depto.estado = 'disponible'
        depto.save()
        depto.refresh_from_db()
        self.assertEqual(depto.codigo_acceso, codigo)


class AvancePorCodigoEndpointTest(BaseTestData, TestCase):
    """Tests del endpoint público GET /api/avance/<codigo>/."""

    def setUp(self):
        self.client = APIClient()
        self.proyecto = self.crear_proyecto(nombre='Boreal')
        self.nivel = self.crear_nivel(self.proyecto)
        self.depto = self.crear_departamento(
            self.nivel, codigo='901', estado='vendido',
        )
        self.depto.refresh_from_db()
        self.assertIsNotNone(self.depto.codigo_acceso)

        # Algunos avances
        self.crear_avance(self.proyecto, titulo='Avance 1')
        self.crear_avance(self.proyecto, titulo='Avance 2')
        # Un avance no publicado (no debe aparecer)
        self.crear_avance(
            self.proyecto, titulo='Borrador', publicado=False,
        )

    def _url(self, codigo):
        return f'/api/avance/{codigo}/'

    def test_endpoint_avance_devuelve_data_correcta(self):
        resp = self.client.get(self._url(self.depto.codigo_acceso))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.json()
        self.assertIn('proyecto', data)
        self.assertIn('departamento', data)
        self.assertIn('avances', data)
        self.assertEqual(data['proyecto']['nombre'], 'Boreal')
        self.assertEqual(data['departamento']['codigo'], '901')
        # Solo avances publicados
        titulos = [a['titulo'] for a in data['avances']]
        self.assertIn('Avance 1', titulos)
        self.assertIn('Avance 2', titulos)
        self.assertNotIn('Borrador', titulos)

    def test_endpoint_avance_404_si_codigo_invalido(self):
        resp = self.client.get(self._url('NO-EXISTE-XXXX'))
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_endpoint_avance_404_si_codigo_inactivo(self):
        """Si Diana revoca el acceso, el código devuelve 404."""
        self.depto.codigo_activo = False
        self.depto.save()
        resp = self.client.get(self._url(self.depto.codigo_acceso))
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    @override_settings(REST_FRAMEWORK={
        'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.AllowAny'],
        'DEFAULT_THROTTLE_CLASSES': [
            'rest_framework.throttling.AnonRateThrottle',
        ],
        'DEFAULT_THROTTLE_RATES': {
            'anon': '1000/min',
            'datos_bancarios': '5/min',
            'avance_comprador': '20/min',
        },
        'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
        'PAGE_SIZE': 20,
    })
    def test_endpoint_avance_throttle_20_por_minuto(self):
        """A partir de la solicitud 21 en una ventana, se devuelve 429."""
        from django.core.cache import cache as dj_cache
        # Limpiamos contadores de throttle previos
        dj_cache.clear()

        # Necesitamos cache real para que el throttle cuente. Forzamos
        # LocMemCache para este test.
        with override_settings(CACHES={
            'default': {
                'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
                'LOCATION': 'avance-throttle-test',
            },
        }):
            from django.core.cache import cache
            cache.clear()
            url = self._url(self.depto.codigo_acceso)
            ok = 0
            for _ in range(20):
                r = self.client.get(url)
                if r.status_code == 200:
                    ok += 1
            self.assertEqual(ok, 20, 'Las primeras 20 deben pasar')

            # La 21 debe ser 429
            r = self.client.get(url)
            self.assertEqual(r.status_code, status.HTTP_429_TOO_MANY_REQUESTS)


class CodigoColisionTest(BaseTestData, TestCase):
    """Test de robustez: si el sufijo aleatorio colisiona, reintenta."""

    def test_reintenta_ante_colision(self):
        """Si secrets devuelve un código duplicado en el primer intento, el
        save() debe reintentar y eventualmente generar uno único."""
        proyecto = self.crear_proyecto(nombre='Boreal')
        nivel = self.crear_nivel(proyecto)
        # Primer depto vendido genera un código real
        depto1 = self.crear_departamento(nivel, codigo='100', estado='vendido')
        depto1.refresh_from_db()
        codigo_existente = depto1.codigo_acceso
        self.assertIsNotNone(codigo_existente)

        # Forzamos que el primer intento devuelva el código existente y el
        # segundo uno nuevo.
        rand_suffix_existente = codigo_existente.split('-')[-1]
        with patch(
            'projects.models._generar_codigo_acceso',
            side_effect=[
                codigo_existente,                  # intento 1 - colisión
                f'BOR-200-{rand_suffix_existente[::-1]}',  # intento 2 - único
            ],
        ):
            depto2 = self.crear_departamento(
                nivel, codigo='200', estado='vendido',
            )
        depto2.refresh_from_db()
        self.assertIsNotNone(depto2.codigo_acceso)
        self.assertNotEqual(depto2.codigo_acceso, codigo_existente)
