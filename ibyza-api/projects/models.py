from django.db import models
from django.utils.text import slugify


class Proyecto(models.Model):
    ESTADO_CHOICES = [
        ('en_venta', 'En Venta'),
        ('preventa', 'En Preventa'),
        ('en_construccion', 'En Construcción'),
        ('vendido', 'Vendido'),
    ]

    nombre = models.CharField(
        'Nombre del proyecto', max_length=200,
        help_text='Ejemplo: Boreal, Parke 10, IBYZA Tower',
    )
    slug = models.SlugField(
        'URL amigable', unique=True, blank=True,
        help_text='Se genera automáticamente desde el nombre. No es necesario editarla.',
    )
    descripcion_corta = models.CharField(
        'Descripción corta', max_length=300,
        help_text='Texto breve que aparece en las tarjetas del listado de proyectos (máx. 300 caracteres).',
    )
    descripcion = models.TextField(
        'Descripción completa',
        help_text='Texto largo que aparece en la página de detalle del proyecto.',
    )
    ubicacion = models.CharField(
        'Ubicación', max_length=300,
        help_text='Dirección o zona. Ejemplo: Umacollo, Arequipa.',
    )
    google_maps_embed = models.TextField(
        'Mapa de Google (código embed)', blank=True,
        help_text='Pega aquí el código que copies de Google Maps (Compartir → Insertar mapa).',
    )
    imagen_fachada = models.ImageField(
        'Foto de fachada', upload_to='proyectos/', blank=True, null=True,
        help_text='Imagen principal del proyecto. Se muestra en el listado y como hero. Recomendado: 1200×800 px.',
    )
    imagen_isometrico = models.ImageField(
        'Render isométrico (opcional)', upload_to='proyectos/', blank=True, null=True,
        help_text='Render 3D del edificio completo. Se muestra en la página de detalle.',
    )
    catalogo_pdf = models.FileField(
        'Catálogo en PDF (opcional)', upload_to='catalogos/', blank=True, null=True,
        help_text='El cliente podrá descargarlo desde la página del proyecto.',
    )
    estado = models.CharField(
        'Estado del proyecto', max_length=20, choices=ESTADO_CHOICES, default='en_venta',
        help_text='Determina la etiqueta de color que se muestra en el sitio.',
    )
    precio_desde = models.DecimalField(
        'Precio desde (S/)', max_digits=12, decimal_places=2, default=0,
        help_text='Precio del departamento más barato disponible. Solo informativo.',
    )
    orden = models.PositiveIntegerField(
        'Orden de aparición', default=0,
        help_text='Los proyectos con menor número aparecen primero en el sitio.',
    )
    activo = models.BooleanField(
        'Visible en el sitio', default=True,
        help_text='Desmarca para ocultar el proyecto de la web sin eliminarlo.',
    )

    # Datos bancarios para transferencia (cada proyecto puede tener empresa receptora diferente)
    empresa_receptora = models.CharField(
        'Empresa receptora del pago', max_length=200, blank=True,
        help_text='Razón social que aparece al cliente cuando elige "Transferencia".',
    )
    empresa_ruc = models.CharField('RUC', max_length=20, blank=True)
    empresa_banco = models.CharField(
        'Banco', max_length=100, blank=True,
        help_text='Ejemplo: BCP - Banco de Crédito del Perú',
    )
    cuenta_soles = models.CharField('Cuenta corriente en Soles (S/)', max_length=50, blank=True)
    cci_soles = models.CharField('CCI Soles (interbancario)', max_length=50, blank=True)
    cuenta_dolares = models.CharField('Cuenta corriente en Dólares (US$)', max_length=50, blank=True)
    cci_dolares = models.CharField('CCI Dólares (interbancario)', max_length=50, blank=True)

    class Meta:
        verbose_name = 'Proyecto'
        verbose_name_plural = 'Proyectos'
        ordering = ['orden', 'nombre']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.nombre)
            slug = base_slug
            counter = 1
            while Proyecto.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nombre


class Nivel(models.Model):
    proyecto = models.ForeignKey(
        Proyecto, on_delete=models.CASCADE, related_name='niveles', verbose_name='Proyecto',
    )
    numero = models.PositiveIntegerField(
        'Número de piso',
        help_text='Ejemplo: 1, 2, 3 (para sótanos puedes usar 0).',
    )
    nombre = models.CharField(
        'Nombre del nivel (opcional)', max_length=100, blank=True,
        help_text='Ejemplo: "Piso 1", "Penthouse", "Sótano". Si lo dejas vacío se usará "Nivel N".',
    )
    imagen_planta = models.ImageField(
        'Plano del piso', upload_to='plantas/', blank=True, null=True,
        help_text='Imagen del plano de planta de este nivel. PNG o JPG, recomendado 1200 px de ancho.',
    )
    orden = models.PositiveIntegerField(
        'Orden', default=0,
        help_text='Menor número aparece primero.',
    )

    class Meta:
        verbose_name = 'Piso / Nivel'
        verbose_name_plural = 'Pisos / Niveles'
        ordering = ['orden', 'numero']

    def __str__(self):
        return f'{self.proyecto} — Nivel {self.numero}'


class Departamento(models.Model):
    ESTADO_CHOICES = [
        ('disponible', 'Disponible'),
        ('separado', 'Separado'),
        ('vendido', 'Vendido'),
    ]
    TIPO_CHOICES = [
        ('1dorm', '1 Dormitorio'),
        ('2dorm', '2 Dormitorios'),
        ('3dorm', '3 Dormitorios'),
        ('duplex', 'Dúplex'),
        ('oficina', 'Oficina'),
        ('tienda', 'Tienda'),
    ]

    nivel = models.ForeignKey(
        Nivel, on_delete=models.CASCADE, related_name='departamentos', verbose_name='Piso',
    )
    codigo = models.CharField(
        'Código del depto', max_length=20,
        help_text='Identificador interno. Ejemplo: 101, 202-A, PH1.',
    )
    tipo = models.CharField('Tipo', max_length=20, choices=TIPO_CHOICES)
    area_total = models.DecimalField(
        'Área total (m²)', max_digits=8, decimal_places=2,
        help_text='Suma de área techada + balcones / terrazas.',
    )
    area_techada = models.DecimalField(
        'Área techada (m²)', max_digits=8, decimal_places=2,
        help_text='Solo el área cerrada del departamento.',
    )
    precio = models.DecimalField('Precio (S/)', max_digits=12, decimal_places=2)
    estado = models.CharField(
        'Estado de venta', max_length=20, choices=ESTADO_CHOICES, default='disponible',
        help_text='Cuando un cliente separa un depto, este estado cambia automáticamente.',
    )
    descripcion = models.TextField(
        'Descripción (opcional)', blank=True,
        help_text='Detalles adicionales: vista, orientación, características especiales.',
    )
    imagen_planta = models.ImageField(
        'Plano del depto (opcional)', upload_to='deptos/', blank=True, null=True,
        help_text='Plano específico de este departamento. Si lo dejas vacío, se usará el plano del nivel.',
    )

    class Meta:
        verbose_name = 'Departamento'
        verbose_name_plural = 'Departamentos'
        ordering = ['nivel__numero', 'codigo']

    def __str__(self):
        return f'{self.nivel.proyecto} — Depto {self.codigo}'


class AvanceDeObra(models.Model):
    proyecto = models.ForeignKey(
        Proyecto, on_delete=models.CASCADE, related_name='avances', verbose_name='Proyecto',
    )
    titulo = models.CharField(
        'Título', max_length=200,
        help_text='Ejemplo: "Avance estructural 60%", "Acabados terminados".',
    )
    contenido = models.TextField(
        'Descripción del avance',
        help_text='Texto que verán los clientes.',
    )
    imagen = models.ImageField(
        'Foto del avance', upload_to='avances/', blank=True, null=True,
        help_text='Foto reciente de obra. Recomendado: 1200×800 px.',
    )
    fecha = models.DateField(
        'Fecha del avance',
        help_text='Fecha en que se tomó la foto / se realizó el progreso.',
    )
    publicado = models.BooleanField(
        'Visible en el sitio', default=True,
        help_text='Desmarca para ocultar este avance sin eliminarlo.',
    )

    class Meta:
        verbose_name = 'Avance de Obra'
        verbose_name_plural = 'Avances de Obra'
        ordering = ['-fecha']

    def __str__(self):
        return f'{self.proyecto} — {self.titulo}'


class VideoProyecto(models.Model):
    proyecto = models.ForeignKey(
        Proyecto, on_delete=models.CASCADE, related_name='videos', verbose_name='Proyecto',
    )
    titulo = models.CharField('Título del video', max_length=200)
    youtube_url = models.URLField(
        'URL de YouTube',
        help_text='Pega la URL completa del video. Ejemplo: https://www.youtube.com/watch?v=ABC123',
    )
    orden = models.PositiveIntegerField(
        'Orden', default=0,
        help_text='Menor número aparece primero.',
    )

    class Meta:
        verbose_name = 'Video del proyecto'
        verbose_name_plural = 'Videos del proyecto'
        ordering = ['orden']

    def __str__(self):
        return f'{self.proyecto} — {self.titulo}'


class ImagenGaleria(models.Model):
    proyecto = models.ForeignKey(
        Proyecto, on_delete=models.CASCADE, related_name='galeria', verbose_name='Proyecto',
    )
    imagen = models.ImageField(
        'Imagen', upload_to='galeria/',
        help_text='Foto del proyecto (renders, ambientes, áreas comunes). Recomendado: 1600×1200 px.',
    )
    descripcion = models.CharField(
        'Pie de foto (opcional)', max_length=200, blank=True,
        help_text='Texto que aparece debajo de la imagen al ampliarla.',
    )
    orden = models.PositiveIntegerField(
        'Orden', default=0,
        help_text='Menor número aparece primero en la galería.',
    )

    class Meta:
        verbose_name = 'Foto de galería'
        verbose_name_plural = 'Galería de fotos'
        ordering = ['orden']

    def __str__(self):
        return f'{self.proyecto} — Imagen {self.orden}'
