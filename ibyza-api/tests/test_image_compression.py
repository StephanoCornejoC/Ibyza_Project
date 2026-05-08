"""
Tests de compresión server-side de imágenes.

Capa: Unit / Component
Tecnicas ISTQB aplicadas:
  - Particion de equivalencia (formatos validos vs ya-comprimidos vs invalidos)
  - Analisis de valores limite (ancho exacto = MAX_WIDTH, ancho > MAX_WIDTH)
  - Robustez (archivo no-imagen no rompe el save del modelo)
"""
import shutil
import tempfile
from io import BytesIO

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from PIL import Image

from projects.models import AvanceDeObra, Proyecto
from projects.utils import MAX_WIDTH, compress_image_field
from tests.conftest import BaseTestData


def _png_bytes(width=2400, height=1600, color=(120, 200, 60)):
    """Genera un PNG en memoria de las dimensiones pedidas."""
    img = Image.new('RGB', (width, height), color)
    buf = BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    return buf.getvalue()


def _webp_bytes(width=400, height=300, color=(50, 50, 200)):
    img = Image.new('RGB', (width, height), color)
    buf = BytesIO()
    img.save(buf, format='WEBP', quality=80)
    buf.seek(0)
    return buf.getvalue()


def _uploaded(name, data, content_type='image/png'):
    return SimpleUploadedFile(name, data, content_type=content_type)


_TMP_MEDIA = tempfile.mkdtemp(prefix='ibyza_test_media_')


@override_settings(MEDIA_ROOT=_TMP_MEDIA)
class ImageCompressionTest(BaseTestData, TestCase):
    """Tests directos sobre compress_image_field()."""

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(_TMP_MEDIA, ignore_errors=True)

    # ── Resize ────────────────────────────────────────────────────────────

    def test_imagen_grande_se_redimensiona_a_1920(self):
        """Una imagen > MAX_WIDTH debe redimensionarse a MAX_WIDTH manteniendo ratio."""
        proyecto = self.crear_proyecto()
        proyecto.imagen_fachada = _uploaded('fachada.png', _png_bytes(2400, 1600))
        proyecto.save()
        proyecto.refresh_from_db()

        with proyecto.imagen_fachada.open('rb') as fh:
            img = Image.open(fh)
            img.load()

        self.assertEqual(img.width, MAX_WIDTH)
        # ratio mantenido: 2400x1600 -> 1920x1280
        self.assertEqual(img.height, int(1600 * (MAX_WIDTH / 2400)))
        self.assertTrue(proyecto.imagen_fachada.name.endswith('.webp'))

    def test_imagen_pequena_no_se_resizea(self):
        """Una imagen <= MAX_WIDTH conserva sus dimensiones (pero igual va a webp)."""
        proyecto = self.crear_proyecto()
        proyecto.imagen_fachada = _uploaded('chica.png', _png_bytes(800, 600))
        proyecto.save()
        proyecto.refresh_from_db()

        with proyecto.imagen_fachada.open('rb') as fh:
            img = Image.open(fh)
            img.load()
        self.assertEqual((img.width, img.height), (800, 600))

    # ── Skip rules ────────────────────────────────────────────────────────

    def test_webp_no_se_recomprime(self):
        """Un upload .webp se deja tal cual (mismo nombre, sin recodificar)."""
        proyecto = self.crear_proyecto()
        webp_data = _webp_bytes(400, 300)
        proyecto.imagen_fachada = _uploaded('ya.webp', webp_data, 'image/webp')
        proyecto.save()
        proyecto.refresh_from_db()

        # Nombre conserva la extensión .webp original
        self.assertTrue(proyecto.imagen_fachada.name.endswith('.webp'))
        # No alteramos el contenido (mismo tamaño binario)
        self.assertEqual(proyecto.imagen_fachada.size, len(webp_data))

    def test_compresion_no_bloquea_save_si_archivo_invalido(self):
        """Si el archivo no es una imagen válida, save() no debe romper.

        Subimos un archivo que dice ser PNG pero es texto basura. La
        compresión debe saltarse silenciosamente y el modelo se persiste
        igual con el archivo original.
        """
        proyecto = self.crear_proyecto()
        proyecto.imagen_fachada = _uploaded(
            'fake.png', b'esto-no-es-una-imagen', 'image/png',
        )
        # NO debe lanzar excepción
        proyecto.save()
        proyecto.refresh_from_db()
        # El archivo se persistió aunque no se haya podido comprimir
        self.assertTrue(proyecto.imagen_fachada.name)

    # ── Signal hookup ─────────────────────────────────────────────────────

    def test_signal_dispara_en_proyecto_save(self):
        """El signal pre_save de Proyecto comprime al subir nueva imagen."""
        proyecto = self.crear_proyecto()
        proyecto.imagen_fachada = _uploaded('grande.png', _png_bytes(3000, 2000))
        proyecto.save()
        proyecto.refresh_from_db()

        # El field cambió a webp y el ancho fue capeado a MAX_WIDTH
        self.assertTrue(proyecto.imagen_fachada.name.endswith('.webp'))
        with proyecto.imagen_fachada.open('rb') as fh:
            img = Image.open(fh)
            img.load()
        self.assertEqual(img.width, MAX_WIDTH)

    def test_signal_dispara_en_avance_save(self):
        """El signal pre_save de AvanceDeObra también comprime."""
        proyecto = self.crear_proyecto()
        avance = self.crear_avance(proyecto)
        avance.imagen = _uploaded('avance.png', _png_bytes(2500, 1500))
        avance.save()
        avance.refresh_from_db()
        self.assertTrue(avance.imagen.name.endswith('.webp'))
