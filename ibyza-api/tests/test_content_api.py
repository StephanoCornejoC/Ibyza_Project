"""
Tests de API para la app content (CMS).

Capa: API/Service
Tecnicas ISTQB aplicadas:
  - Particion de equivalencia (seccion valida/invalida, contenido activo/inactivo)
  - Casos de uso (filtrar por seccion, listar todo)
"""
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from content.models import ContenidoWeb
from tests.conftest import BaseTestData


class ContenidoWebAPITest(BaseTestData, TestCase):
    """Tests para GET /api/contenido/"""

    def setUp(self):
        self.client = APIClient()
        self.url = '/api/contenido/'

    # ── Listado general ──────────────────────────────────────────────────

    def test_listar_contenido_activo(self):
        self.crear_contenido_web(seccion='hero', clave='titulo', valor='Bienvenido')
        self.crear_contenido_web(seccion='hero', clave='subtitulo', valor='Sub')
        self.crear_contenido_web(seccion='footer', clave='slogan', activo=False)

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        # Solo los 2 activos
        self.assertEqual(len(results), 2)

    def test_lista_vacia(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 0)

    # ── Filtrado por seccion ─────────────────────────────────────────────

    def test_filtrar_por_seccion_hero(self):
        self.crear_contenido_web(seccion='hero', clave='titulo')
        self.crear_contenido_web(seccion='nosotros', clave='mision')

        response = self.client.get(self.url, {'seccion': 'hero'})
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['seccion'], 'hero')

    def test_filtrar_por_seccion_nosotros(self):
        self.crear_contenido_web(seccion='hero', clave='titulo')
        self.crear_contenido_web(seccion='nosotros', clave='mision')
        self.crear_contenido_web(seccion='nosotros', clave='vision')

        response = self.client.get(self.url, {'seccion': 'nosotros'})
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 2)

    def test_filtrar_seccion_inexistente_retorna_vacio(self):
        self.crear_contenido_web(seccion='hero', clave='titulo')

        response = self.client.get(self.url, {'seccion': 'no-existe'})
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 0)

    def test_sin_filtro_retorna_todo_activo(self):
        self.crear_contenido_web(seccion='hero', clave='titulo')
        self.crear_contenido_web(seccion='nosotros', clave='mision')
        self.crear_contenido_web(seccion='footer', clave='slogan')

        response = self.client.get(self.url)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 3)

    # ── Campos en la respuesta ───────────────────────────────────────────

    def test_campos_respuesta(self):
        self.crear_contenido_web(seccion='hero', clave='titulo', valor='Test')
        response = self.client.get(self.url)
        results = response.data.get('results', response.data)
        item = results[0]
        for campo in ['seccion', 'clave', 'valor', 'imagen']:
            self.assertIn(campo, item, f'Campo {campo} falta en respuesta')

    # ── Contenido inactivo no visible ────────────────────────────────────

    def test_contenido_inactivo_no_aparece(self):
        self.crear_contenido_web(seccion='hero', clave='titulo', activo=True)
        self.crear_contenido_web(seccion='hero', clave='oculto', activo=False)

        response = self.client.get(self.url, {'seccion': 'hero'})
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['clave'], 'titulo')

    # ── Solo GET permitido ───────────────────────────────────────────────

    def test_post_no_permitido(self):
        response = self.client.post(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_put_no_permitido(self):
        response = self.client.put(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete_no_permitido(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class ContenidoWebModelTest(BaseTestData, TestCase):
    """Tests unitarios para el modelo ContenidoWeb."""

    def test_unique_together_seccion_clave(self):
        """No se pueden crear dos contenidos con la misma seccion+clave."""
        self.crear_contenido_web(seccion='hero', clave='titulo')
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            self.crear_contenido_web(seccion='hero', clave='titulo')

    def test_str_formato(self):
        c = self.crear_contenido_web(seccion='hero', clave='titulo')
        s = str(c)
        # Usar get_seccion_display() para que el test sea robusto a cambios de etiqueta
        self.assertIn(c.get_seccion_display(), s)
        self.assertIn('titulo', s)

    def test_ordering_por_seccion_y_clave(self):
        c3 = self.crear_contenido_web(seccion='nosotros', clave='vision')
        c1 = self.crear_contenido_web(seccion='contacto', clave='direccion')
        c2 = self.crear_contenido_web(seccion='hero', clave='titulo')
        contenidos = list(ContenidoWeb.objects.all())
        # contacto < footer < hero < nosotros (orden alfabetico de seccion)
        self.assertEqual(contenidos[0].seccion, 'contacto')
