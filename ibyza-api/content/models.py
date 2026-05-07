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
        db_index=True,
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
        db_index=True,
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

    # === Sección "Origen del nombre" — al final del Home (deuda técnica Sprint 1) ===
    origen_nombre_texto = models.TextField(
        'Texto sobre el origen del nombre IBYZA',
        blank=True,
        default='El nombre IBYZA surge de la unión de los apellidos Ibáñez y Zavala, fundadores de la empresa.',
        help_text='Aparece al final de la página de inicio. Edítalo cuando quieras.',
    )

    # === Modal de bienvenida — Sprint 2 ===
    modal_activo = models.BooleanField(
        'Modal de bienvenida activo',
        default=False,
        help_text='Marca esto para mostrar un modal cuando el visitante entra al sitio (una vez por sesión).',
    )
    modal_titulo = models.CharField(
        'Título del modal', max_length=200, blank=True,
        default='Conoce nuestro nuevo proyecto',
    )
    modal_subtitulo = models.TextField(
        'Subtítulo del modal', blank=True,
        default='Departamentos disponibles con la mejor ubicación de Arequipa.',
    )
    modal_imagen = models.ImageField(
        'Imagen del modal',
        upload_to='modal/', blank=True, null=True,
        help_text='Imagen destacada del modal. Recomendado: 1200×800 px, máximo 500 KB.',
    )
    modal_proyecto = models.ForeignKey(
        'projects.Proyecto', on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='+',
        verbose_name='Proyecto destacado en modal',
        help_text='Si seleccionas un proyecto, el botón del modal lleva a su página.',
    )
    modal_cta_texto = models.CharField(
        'Texto del botón del modal',
        max_length=100, blank=True, default='Ver proyecto',
    )
    modal_cta_es_whatsapp = models.BooleanField(
        'El botón abre WhatsApp en lugar del proyecto',
        default=False,
        help_text='Si lo activas, el botón del modal abre WhatsApp con un mensaje pre-armado.',
    )

    # === Confirmación de citas — Sprint 2 ===
    meet_link_permanente = models.URLField(
        'Link permanente de Google Meet',
        blank=True,
        help_text='Pega aquí un link de Meet permanente (ej: meet.google.com/abc-defg-hij). Se incluirá en la confirmación de citas virtuales.',
    )

    # === Politicas de Privacidad ===
    politicas_privacidad_html = models.TextField(
        'Texto de Politicas de Privacidad (HTML)',
        blank=True,
        default=(
            '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. '
            'Donec euismod, nibh ac vulputate efficitur, urna nulla finibus odio.</p>'
            '<p>Pellentesque habitant morbi tristique senectus et netus et malesuada '
            'fames ac turpis egestas.</p>'
        ),
        help_text='Soporta HTML basico (p, ul, li, strong, br). Aparece en el modal de "Acepto las politicas de privacidad" del formulario de cita.',
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
        db_index=True,
    )
    activo = models.BooleanField(
        'Visible en el sitio', default=True,
        help_text='Desmarca para ocultar esta pregunta sin borrarla.',
        db_index=True,
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
        db_index=True,
    )
    activo = models.BooleanField(
        'Visible en el sitio', default=True,
        help_text='Desmarca para ocultar este testimonio sin borrarlo.',
        db_index=True,
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
        db_index=True,
    )
    activo = models.BooleanField(
        'Visible en el sitio', default=True,
        help_text='Desmarca para ocultar este beneficio sin borrarlo.',
        db_index=True,
    )

    class Meta:
        verbose_name = 'Beneficio / Valor'
        verbose_name_plural = 'Beneficios / Valores'
        ordering = ['orden']

    def __str__(self):
        return self.titulo
