"""
Tests de API para la app projects.

Capa: API/Service
Tecnicas ISTQB aplicadas:
  - Particion de equivalencia (proyecto activo vs inactivo)
  - Analisis de valores limite (slug inexistente, proyecto sin departamentos)
  - Casos de uso (listar, detallar, filtrar)
"""
from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from tests.conftest import BaseTestData


class ProyectoListAPITest(BaseTestData, TestCase):
    """Tests para GET /api/proyectos/"""

    def setUp(self):
        self.client = APIClient()
        self.url = '/api/proyectos/'

    def test_listar_proyectos_activos(self):
        self.crear_proyecto(nombre='Activo 1')
        self.crear_proyecto(nombre='Activo 2')
        self.crear_proyecto(nombre='Inactivo', activo=False)

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Paginado: results contiene solo activos
        results = response.data.get('results', response.data)
        nombres = [p['nombre'] for p in results]
        self.assertIn('Activo 1', nombres)
        self.assertIn('Activo 2', nombres)
        self.assertNotIn('Inactivo', nombres)

    def test_lista_vacia_sin_proyectos(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 0)

    def test_campos_del_listado(self):
        """El serializer de listado debe incluir los campos esperados."""
        self.crear_proyecto(nombre='Test Campos')
        response = self.client.get(self.url)
        results = response.data.get('results', response.data)
        proyecto = results[0]
        campos_esperados = [
            'id', 'nombre', 'slug', 'descripcion_corta', 'ubicacion',
            'imagen_fachada', 'estado', 'estado_display', 'precio_desde',
        ]
        for campo in campos_esperados:
            self.assertIn(campo, proyecto, f'Campo {campo} falta en respuesta de listado')

    def test_no_incluye_descripcion_completa_en_listado(self):
        """El listado no debe incluir la descripcion completa (solo corta)."""
        self.crear_proyecto()
        response = self.client.get(self.url)
        results = response.data.get('results', response.data)
        self.assertNotIn('descripcion', results[0])


class ProyectoDetailAPITest(BaseTestData, TestCase):
    """Tests para GET /api/proyectos/<slug>/"""

    def setUp(self):
        self.client = APIClient()

    def test_detalle_proyecto_existente(self):
        p = self.crear_proyecto(nombre='Bolivar 205')
        response = self.client.get(f'/api/proyectos/{p.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], 'Bolivar 205')

    def test_detalle_incluye_relaciones_anidadas(self):
        p = self.crear_proyecto(nombre='Con Relaciones')
        n = self.crear_nivel(p)
        self.crear_departamento(n)
        self.crear_avance(p)

        response = self.client.get(f'/api/proyectos/{p.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('niveles', response.data)
        self.assertIn('avances', response.data)
        self.assertIn('videos', response.data)
        self.assertIn('galeria', response.data)

    def test_detalle_incluye_departamentos_dentro_de_niveles(self):
        p = self.crear_proyecto()
        n = self.crear_nivel(p)
        self.crear_departamento(n, codigo='101')

        response = self.client.get(f'/api/proyectos/{p.slug}/')
        niveles = response.data['niveles']
        self.assertGreater(len(niveles), 0)
        self.assertIn('departamentos', niveles[0])
        self.assertGreater(len(niveles[0]['departamentos']), 0)

    def test_detalle_slug_inexistente_retorna_404(self):
        response = self.client.get('/api/proyectos/slug-que-no-existe/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_detalle_proyecto_inactivo_retorna_404(self):
        p = self.crear_proyecto(nombre='Inactivo', activo=False)
        response = self.client.get(f'/api/proyectos/{p.slug}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_campos_detalle(self):
        p = self.crear_proyecto()
        response = self.client.get(f'/api/proyectos/{p.slug}/')
        campos_esperados = [
            'id', 'nombre', 'slug', 'descripcion', 'descripcion_corta',
            'ubicacion', 'google_maps_embed', 'imagen_fachada',
            'imagen_isometrico', 'catalogo_pdf', 'estado', 'estado_display',
            'precio_desde', 'niveles', 'avances', 'videos', 'galeria',
        ]
        for campo in campos_esperados:
            self.assertIn(campo, response.data, f'Campo {campo} falta en detalle')


class DepartamentosAPITest(BaseTestData, TestCase):
    """Tests para GET /api/proyectos/<slug>/departamentos/"""

    def setUp(self):
        self.client = APIClient()
        self.proyecto = self.crear_proyecto(nombre='Filtro Test')
        self.nivel = self.crear_nivel(self.proyecto)

    def test_listar_departamentos_de_proyecto(self):
        self.crear_departamento(self.nivel, codigo='101')
        self.crear_departamento(self.nivel, codigo='102')

        response = self.client.get(f'/api/proyectos/{self.proyecto.slug}/departamentos/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 2)

    def test_filtrar_por_estado(self):
        self.crear_departamento(self.nivel, codigo='101', estado='disponible')
        self.crear_departamento(self.nivel, codigo='102', estado='vendido')

        response = self.client.get(
            f'/api/proyectos/{self.proyecto.slug}/departamentos/',
            {'estado': 'disponible'},
        )
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['estado'], 'disponible')

    def test_filtrar_por_tipo(self):
        self.crear_departamento(self.nivel, codigo='101', tipo='1dorm')
        self.crear_departamento(self.nivel, codigo='201', tipo='2dorm')
        self.crear_departamento(self.nivel, codigo='301', tipo='duplex')

        response = self.client.get(
            f'/api/proyectos/{self.proyecto.slug}/departamentos/',
            {'tipo': '2dorm'},
        )
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['tipo'], '2dorm')

    def test_departamentos_proyecto_inexistente(self):
        response = self.client.get('/api/proyectos/no-existe/departamentos/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 0)

    def test_no_muestra_departamentos_de_proyecto_inactivo(self):
        p_inactivo = self.crear_proyecto(nombre='Inactivo', activo=False)
        n = self.crear_nivel(p_inactivo, numero=1)
        self.crear_departamento(n, codigo='X01')

        response = self.client.get(f'/api/proyectos/{p_inactivo.slug}/departamentos/')
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 0)


class AvancesAPITest(BaseTestData, TestCase):
    """Tests para GET /api/proyectos/<slug>/avances/"""

    def setUp(self):
        self.client = APIClient()
        self.proyecto = self.crear_proyecto(nombre='Avance Test')

    def test_listar_avances_publicados(self):
        self.crear_avance(self.proyecto, titulo='Publicado')
        self.crear_avance(self.proyecto, titulo='No publicado', publicado=False)

        response = self.client.get(f'/api/proyectos/{self.proyecto.slug}/avances/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['titulo'], 'Publicado')

    def test_avances_proyecto_inexistente_retorna_lista_vacia(self):
        response = self.client.get('/api/proyectos/no-existe/avances/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 0)
