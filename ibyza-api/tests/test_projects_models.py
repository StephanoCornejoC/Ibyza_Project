"""
Tests unitarios para modelos de la app projects.

Capa: Unit/Component
Tecnicas ISTQB aplicadas:
  - Particion de equivalencia (estados validos/invalidos)
  - Analisis de valores limite (slugs duplicados, campos vacios)
  - Transicion de estados (disponible -> separado -> vendido)
"""
from decimal import Decimal
from django.test import TestCase
from django.db import IntegrityError
from projects.models import Proyecto, Nivel, Departamento, AvanceDeObra, VideoProyecto, ImagenGaleria
from tests.conftest import BaseTestData


class ProyectoModelTest(BaseTestData, TestCase):
    """Tests para el modelo Proyecto."""

    # ── Creacion basica ──────────────────────────────────────────────────

    def test_crear_proyecto_genera_slug_automaticamente(self):
        """El slug se genera a partir del nombre si no se proporciona."""
        p = self.crear_proyecto(nombre='Bolivar 205')
        self.assertEqual(p.slug, 'bolivar-205')

    def test_crear_proyecto_con_slug_manual(self):
        """Si se proporciona slug, se respeta."""
        p = self.crear_proyecto(nombre='Test', slug='mi-slug-custom')
        self.assertEqual(p.slug, 'mi-slug-custom')

    def test_slug_unico_con_duplicados(self):
        """Dos proyectos con el mismo nombre deben generar slugs diferentes."""
        p1 = self.crear_proyecto(nombre='Proyecto Alfa')
        p2 = self.crear_proyecto(nombre='Proyecto Alfa')
        self.assertEqual(p1.slug, 'proyecto-alfa')
        self.assertEqual(p2.slug, 'proyecto-alfa-1')
        self.assertNotEqual(p1.slug, p2.slug)

    def test_slug_unico_con_tres_duplicados(self):
        """Multiples proyectos con el mismo nombre incrementan el contador."""
        p1 = self.crear_proyecto(nombre='Mismo Nombre')
        p2 = self.crear_proyecto(nombre='Mismo Nombre')
        p3 = self.crear_proyecto(nombre='Mismo Nombre')
        slugs = {p1.slug, p2.slug, p3.slug}
        self.assertEqual(len(slugs), 3, 'Los 3 slugs deben ser diferentes')

    # ── String representation ────────────────────────────────────────────

    def test_str_devuelve_nombre(self):
        p = self.crear_proyecto(nombre='Mira Verde')
        self.assertEqual(str(p), 'Mira Verde')

    # ── Estados ──────────────────────────────────────────────────────────

    def test_estado_default_es_en_venta(self):
        p = self.crear_proyecto()
        self.assertEqual(p.estado, 'en_venta')

    def test_estados_validos(self):
        """Todos los estados del choice deben ser creables."""
        for estado, _ in Proyecto.ESTADO_CHOICES:
            p = self.crear_proyecto(nombre=f'Proyecto {estado}', estado=estado)
            self.assertEqual(p.estado, estado)

    # ── Defaults y campos ────────────────────────────────────────────────

    def test_activo_default_es_true(self):
        p = self.crear_proyecto()
        self.assertTrue(p.activo)

    def test_precio_desde_default(self):
        p = Proyecto.objects.create(
            nombre='Sin Precio',
            descripcion_corta='corta',
            descripcion='larga',
            ubicacion='ubi',
        )
        self.assertEqual(p.precio_desde, Decimal('0'))

    def test_ordering_por_orden_y_nombre(self):
        p2 = self.crear_proyecto(nombre='Beta', orden=2)
        p1 = self.crear_proyecto(nombre='Alfa', orden=1)
        p3 = self.crear_proyecto(nombre='Alfa', orden=1)
        proyectos = list(Proyecto.objects.all())
        # orden 1 primero, luego orden 2; dentro del mismo orden, por nombre
        self.assertEqual(proyectos[0].orden, 1)
        self.assertEqual(proyectos[-1].orden, 2)


class NivelModelTest(BaseTestData, TestCase):
    """Tests para el modelo Nivel."""

    def test_crear_nivel(self):
        p = self.crear_proyecto()
        n = self.crear_nivel(p, numero=3, nombre='Piso 3')
        self.assertEqual(n.numero, 3)
        self.assertEqual(n.proyecto, p)

    def test_str_formato(self):
        p = self.crear_proyecto(nombre='Bolivar 205')
        n = self.crear_nivel(p, numero=2)
        self.assertIn('Nivel 2', str(n))
        self.assertIn('Bolivar 205', str(n))

    def test_relacion_inversa_proyecto_niveles(self):
        p = self.crear_proyecto()
        self.crear_nivel(p, numero=1)
        self.crear_nivel(p, numero=2)
        self.assertEqual(p.niveles.count(), 2)


class DepartamentoModelTest(BaseTestData, TestCase):
    """Tests para el modelo Departamento."""

    def setUp(self):
        self.proyecto = self.crear_proyecto()
        self.nivel = self.crear_nivel(self.proyecto)

    def test_crear_departamento(self):
        d = self.crear_departamento(self.nivel, codigo='201')
        self.assertEqual(d.codigo, '201')
        self.assertEqual(d.estado, 'disponible')

    def test_estado_default_disponible(self):
        d = self.crear_departamento(self.nivel)
        self.assertEqual(d.estado, 'disponible')

    def test_transicion_disponible_a_separado(self):
        d = self.crear_departamento(self.nivel)
        d.estado = 'separado'
        d.save()
        d.refresh_from_db()
        self.assertEqual(d.estado, 'separado')

    def test_transicion_separado_a_vendido(self):
        d = self.crear_departamento(self.nivel, estado='separado')
        d.estado = 'vendido'
        d.save()
        d.refresh_from_db()
        self.assertEqual(d.estado, 'vendido')

    def test_str_incluye_proyecto_y_codigo(self):
        d = self.crear_departamento(self.nivel, codigo='301-A')
        self.assertIn('301-A', str(d))

    def test_tipos_validos(self):
        for tipo, _ in Departamento.TIPO_CHOICES:
            d = self.crear_departamento(self.nivel, codigo=f'T-{tipo}', tipo=tipo)
            self.assertEqual(d.tipo, tipo)

    def test_relacion_inversa_nivel_departamentos(self):
        self.crear_departamento(self.nivel, codigo='101')
        self.crear_departamento(self.nivel, codigo='102')
        self.assertEqual(self.nivel.departamentos.count(), 2)

    def test_ordering_por_nivel_numero_y_codigo(self):
        n2 = self.crear_nivel(self.proyecto, numero=2, orden=2)
        d2 = self.crear_departamento(n2, codigo='201')
        d1 = self.crear_departamento(self.nivel, codigo='101')
        deptos = list(Departamento.objects.all())
        self.assertEqual(deptos[0].codigo, '101')
        self.assertEqual(deptos[1].codigo, '201')


class AvanceDeObraModelTest(BaseTestData, TestCase):
    """Tests para el modelo AvanceDeObra."""

    def test_crear_avance(self):
        p = self.crear_proyecto()
        a = self.crear_avance(p, titulo='Cimentacion terminada')
        self.assertEqual(a.titulo, 'Cimentacion terminada')
        self.assertTrue(a.publicado)

    def test_str_incluye_proyecto_y_titulo(self):
        p = self.crear_proyecto(nombre='Bolivar 205')
        a = self.crear_avance(p, titulo='Avance Enero')
        self.assertIn('Bolivar 205', str(a))
        self.assertIn('Avance Enero', str(a))

    def test_ordering_por_fecha_desc(self):
        from datetime import date
        p = self.crear_proyecto()
        a1 = self.crear_avance(p, titulo='Primero', fecha=date(2026, 1, 1))
        a2 = self.crear_avance(p, titulo='Segundo', fecha=date(2026, 3, 1))
        avances = list(AvanceDeObra.objects.all())
        self.assertEqual(avances[0].titulo, 'Segundo')  # fecha mas reciente primero


class VideoProyectoModelTest(BaseTestData, TestCase):
    """Tests para el modelo VideoProyecto."""

    def test_crear_video(self):
        p = self.crear_proyecto()
        v = VideoProyecto.objects.create(
            proyecto=p,
            titulo='Recorrido virtual',
            youtube_url='https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            orden=1,
        )
        self.assertEqual(v.titulo, 'Recorrido virtual')

    def test_str_incluye_titulo(self):
        p = self.crear_proyecto(nombre='Test')
        v = VideoProyecto.objects.create(
            proyecto=p, titulo='Tour 360', youtube_url='https://youtube.com/test', orden=0,
        )
        self.assertIn('Tour 360', str(v))


class ImagenGaleriaModelTest(BaseTestData, TestCase):
    """Tests para el modelo ImagenGaleria."""

    def test_str_incluye_proyecto_y_orden(self):
        p = self.crear_proyecto(nombre='Mira Verde')
        img = ImagenGaleria.objects.create(
            proyecto=p, imagen='galeria/test.jpg', descripcion='Fachada', orden=1,
        )
        self.assertIn('Mira Verde', str(img))
        self.assertIn('1', str(img))
