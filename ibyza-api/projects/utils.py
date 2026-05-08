"""Compresión de imágenes para reducir uso de storage en R2.

Cuando Diana sube imágenes desde el admin, este módulo las comprime
in-place antes de que Django persista el archivo en el storage. Reduce
costos de R2 y tiempo de carga del visitante.

Reglas:
  - Resize a MAX_WIDTH manteniendo aspect ratio.
  - Conversión a WebP con WEBP_QUALITY.
  - Skip si ya es WebP, SVG o GIF.
  - Skip silencioso si el archivo no se puede leer como imagen.
"""
from io import BytesIO

from django.core.files.base import ContentFile
from PIL import Image

MAX_WIDTH = 1920
WEBP_QUALITY = 80


def compress_image_field(image_field):
    """Comprime in-place un ImageField.

    - Skip si no hay archivo o si ya es WebP.
    - Skip si la imagen es <= MAX_WIDTH (no se redimensiona, pero igual
      se reescribe a WebP para uniformizar formato y bajar peso).
    - Resize manteniendo aspect ratio cuando excede MAX_WIDTH.
    - Convierte a WebP con WEBP_QUALITY.
    - Reemplaza el archivo en el field SIN guardar el modelo (eso lo hace
      Django al final del save()).

    Devuelve True si comprimió, False si saltó.
    """
    if not image_field or not image_field.name:
        return False

    name_lower = image_field.name.lower()
    if name_lower.endswith('.webp'):
        return False  # ya comprimido

    # No comprimimos SVG (no es raster) ni GIF (puede ser animado).
    if name_lower.endswith(('.svg', '.gif')):
        return False

    try:
        # image_field.open() asegura modo binario aunque venga cerrado.
        image_field.open('rb')
        img = Image.open(image_field)
        img.load()
    except Exception:
        # Archivo no es imagen válida o error de lectura. No bloqueamos
        # el save() del modelo: simplemente se guarda tal cual.
        return False

    # Resize si excede MAX_WIDTH
    if img.width > MAX_WIDTH:
        ratio = MAX_WIDTH / img.width
        new_size = (MAX_WIDTH, int(img.height * ratio))
        img = img.resize(new_size, Image.LANCZOS)

    # WebP no maneja bien modo P (paleta). Convertir a RGB/RGBA según
    # tenga o no canal alpha.
    if img.mode == 'P':
        img = img.convert('RGBA' if 'transparency' in img.info else 'RGB')
    elif img.mode == 'CMYK':
        img = img.convert('RGB')

    # Encodear a WebP en memoria
    output = BytesIO()
    img.save(output, format='WEBP', quality=WEBP_QUALITY, method=6)
    output.seek(0)

    # Nombre nuevo: mismo basename pero con extensión .webp
    base_name = image_field.name.rsplit('/', 1)[-1].rsplit('.', 1)[0]
    new_name = f'{base_name}.webp'

    # save=False: solo actualiza el field. Modelo.save() persiste al final.
    image_field.save(new_name, ContentFile(output.read()), save=False)
    return True
