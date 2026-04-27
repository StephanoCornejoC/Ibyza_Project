from django.db import models


class ContenidoWeb(models.Model):
    SECCION_CHOICES = [
        ('hero', 'Inicio — Sección principal (hero)'),
        ('nosotros', 'Página Nosotros'),
        ('contacto', 'Página Contacto'),
        ('footer', 'Pie de página (footer)'),
    ]

    seccion = models.CharField(
        'Sección de la web', max_length=50, choices=SECCION_CHOICES,
        help_text='En qué parte del sitio aparece este texto.',
    )
    clave = models.CharField(
        'Identificador interno', max_length=100,
        help_text='Nombre técnico (no editar si no sabes qué es). Ejemplos: titulo, subtitulo, descripcion.',
    )
    valor = models.TextField(
        'Texto que se muestra', blank=True,
        help_text='Lo que verá el cliente en el sitio.',
    )
    imagen = models.ImageField(
        'Imagen asociada (opcional)', upload_to='contenido/', blank=True, null=True,
        help_text='Solo para textos que también requieren una imagen (ejemplo: hero principal).',
    )
    activo = models.BooleanField(
        'Visible en el sitio', default=True,
        help_text='Desmarca para ocultar este contenido sin borrarlo.',
    )

    class Meta:
        verbose_name = 'Texto e imagen del sitio'
        verbose_name_plural = 'Textos e imágenes del sitio'
        ordering = ['seccion', 'clave']
        unique_together = ['seccion', 'clave']

    def __str__(self):
        return f'{self.get_seccion_display()} → {self.clave}'


class ConfiguracionSitio(models.Model):
    """Configuración global del sitio — singleton (solo 1 registro)."""
    # Contacto
    direccion = models.CharField(
        'Dirección de oficina', max_length=300,
        default='Puente Bolivar 205, Umacollo, Arequipa',
        help_text='Aparece en el footer y en la página de contacto.',
    )
    telefono = models.CharField(
        'Teléfono principal', max_length=50,
        default='+51 993 674 174',
        help_text='Incluye el código de país (+51 para Perú).',
    )
    email = models.EmailField(
        'Correo de contacto', default='ventas@ibyzacorp.com',
        help_text='Correo público que se muestra a los clientes.',
    )
    horario = models.CharField(
        'Horario de atención', max_length=200,
        default='Lun-Vie: 9:00 AM - 6:00 PM | Sab: 9:00 AM - 1:00 PM',
    )
    whatsapp = models.CharField(
        'Número de WhatsApp', max_length=50, default='+51993674174',
        help_text='Sin espacios ni guiones. Ejemplo: +51993674174',
    )

    # Redes sociales
    facebook_url = models.URLField(
        'Enlace de Facebook', blank=True,
        default='https://www.facebook.com/profile.php?id=61580984001744',
        help_text='URL completa del perfil de Facebook.',
    )
    instagram_url = models.URLField(
        'Enlace de Instagram', blank=True,
        help_text='URL completa del perfil de Instagram.',
    )
    tiktok_url = models.URLField('Enlace de TikTok', blank=True)
    linkedin_url = models.URLField('Enlace de LinkedIn', blank=True)
    youtube_url = models.URLField('Enlace de YouTube', blank=True)

    # SEO / Branding
    slogan = models.CharField(
        'Slogan principal', max_length=300,
        default='Tu mejor inversión al mejor precio y en la mejor ubicación',
        help_text='Frase corta que aparece en el hero del sitio.',
    )
    descripcion_empresa = models.TextField(
        'Descripción de la empresa',
        default='Somos una empresa de servicios generales que cuenta con profesionales altamente calificados.',
        help_text='Aparece en metadatos SEO y en algunas secciones del sitio.',
    )

    class Meta:
        verbose_name = 'Configuración general del sitio'
        verbose_name_plural = 'Configuración general del sitio'

    def save(self, *args, **kwargs):
        # Singleton: solo permite 1 registro
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass  # No permitir eliminar

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return 'Configuración del sitio'


class PreguntaFrecuente(models.Model):
    """Preguntas frecuentes mostradas en el sitio web."""
    pregunta = models.CharField('Pregunta', max_length=300)
    respuesta = models.TextField('Respuesta')
    orden = models.PositiveIntegerField(
        'Orden', default=0,
        help_text='Menor número aparece primero en la sección de FAQ.',
    )
    activo = models.BooleanField(
        'Visible en el sitio', default=True,
        help_text='Desmarca para ocultar esta pregunta sin borrarla.',
    )

    class Meta:
        verbose_name = 'Pregunta frecuente'
        verbose_name_plural = 'Preguntas frecuentes'
        ordering = ['orden', 'pregunta']

    def __str__(self):
        return self.pregunta[:60]


class Testimonio(models.Model):
    """Testimonios de clientes mostrados en el sitio."""
    nombre = models.CharField('Nombre del cliente', max_length=150)
    cargo = models.CharField(
        'Cargo / Ocupación', max_length=200, blank=True,
        help_text='Ejemplo: "Cliente de Boreal", "Inversionista". Opcional.',
    )
    proyecto = models.ForeignKey(
        'projects.Proyecto', on_delete=models.SET_NULL,
        related_name='testimonios', verbose_name='Proyecto relacionado (opcional)',
        blank=True, null=True,
        help_text='Si el testimonio menciona un proyecto en particular, selecciónalo aquí.',
    )
    testimonio = models.TextField(
        'Texto del testimonio',
        help_text='Cita textual del cliente.',
    )
    foto = models.ImageField(
        'Foto del cliente (opcional)', upload_to='testimonios/', blank=True, null=True,
        help_text='Idealmente cuadrada, recomendado 400×400 px.',
    )
    calificacion = models.PositiveSmallIntegerField(
        'Calificación (1 a 5 estrellas)', default=5,
        help_text='Cantidad de estrellas que se muestran junto al testimonio.',
    )
    orden = models.PositiveIntegerField(
        'Orden', default=0,
        help_text='Menor número aparece primero.',
    )
    activo = models.BooleanField(
        'Visible en el sitio', default=True,
        help_text='Desmarca para ocultar este testimonio sin borrarlo.',
    )

    class Meta:
        verbose_name = 'Testimonio'
        verbose_name_plural = 'Testimonios'
        ordering = ['orden', '-id']

    def __str__(self):
        return f'{self.nombre} — {self.calificacion}★'


class Beneficio(models.Model):
    """Beneficios/ventajas de comprar con IBYZA (sección home 'Por qué IBYZA')."""
    titulo = models.CharField(
        'Título del beneficio', max_length=150,
        help_text='Frase corta. Ejemplo: "Ubicación estratégica", "Acabados premium".',
    )
    descripcion = models.TextField(
        'Descripción', help_text='Explicación del beneficio (1-2 oraciones).',
    )
    icono = models.CharField(
        'Icono', max_length=50, default='ShieldCheck',
        help_text='Nombre exacto de un icono de Lucide. Lista: https://lucide.dev/icons. Ejemplos: Home, Key, Award, ShieldCheck.',
    )
    orden = models.PositiveIntegerField(
        'Orden', default=0,
        help_text='Menor número aparece primero.',
    )
    activo = models.BooleanField(
        'Visible en el sitio', default=True,
        help_text='Desmarca para ocultar este beneficio sin borrarlo.',
    )

    class Meta:
        verbose_name = 'Beneficio / Valor'
        verbose_name_plural = 'Beneficios / Valores'
        ordering = ['orden']

    def __str__(self):
        return self.titulo
