from django.db import models


class ContenidoWeb(models.Model):
    PAGINA_CHOICES = [
        ('inicio',    'Página Inicio'),
        ('nosotros',  'Página Nosotros'),
        ('proyectos', 'Página Proyectos'),
        ('separar',   'Página Separar'),
        ('contacto',  'Página Contacto'),
        ('global',    'Global (footer, modales)'),
    ]

    SECCION_CHOICES = [
        ('hero',             'Hero principal'),
        ('quienes_somos',    'Quiénes Somos'),
        ('mision_vision',    'Misión / Visión / Compromiso'),
        ('valores',          'Lo que nos define (valores)'),
        ('cta_final',        'CTA inferior'),
        ('carrusel',         'Carrusel de proyectos'),
        ('info_contacto',    'Información de contacto'),
        ('formulario',       'Formulario'),
        ('footer',           'Pie de página'),
        ('modal_bienvenida', 'Modal de bienvenida'),
    ]

    pagina = models.CharField(
        'Página de la web', max_length=20, choices=PAGINA_CHOICES,
        default='inicio',
        help_text='Página del sitio donde aparece este contenido.',
        db_index=True,
    )
    seccion = models.CharField(
        'Sección dentro de la página', max_length=50, choices=SECCION_CHOICES,
        help_text='Bloque dentro de la página (Hero, CTA, Misión, etc.).',
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
    orden = models.PositiveIntegerField(
        'Orden dentro de la sección', default=0,
        help_text='Menor número aparece primero.',
        db_index=True,
    )
    activo = models.BooleanField(
        'Visible en el sitio', default=True,
        help_text='Desmarca para ocultar este contenido sin borrarlo.',
        db_index=True,
    )

    class Meta:
        verbose_name = 'Texto e imagen del sitio'
        verbose_name_plural = 'Textos e imágenes del sitio'
        ordering = ['pagina', 'seccion', 'orden', 'clave']
        unique_together = ['pagina', 'seccion', 'clave']

    def __str__(self):
        return f'{self.get_pagina_display()} → {self.get_seccion_display()} → {self.clave}'


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


class Beneficio(models.Model):
    """Valores / beneficios de IBYZA. Aparecen en la sección "Lo que nos define"
    de la página Nosotros (carrusel con auto-play). Editables 100% desde admin:
    título, descripción, imagen de fondo y icono."""

    titulo = models.CharField(
        'Título del valor', max_length=150,
        help_text='Nombre corto. Ejemplo: "Compromiso", "Calidad", "Innovación".',
    )
    descripcion = models.TextField(
        'Descripción', help_text='Frase explicativa (1-2 oraciones).',
    )
    imagen = models.ImageField(
        'Imagen de fondo', upload_to='valores/', blank=True, null=True,
        help_text='Imagen que aparece de fondo en la card del valor. Recomendado: 800×600 px, máximo 400 KB. Si no subís imagen, la card queda con fondo oscuro plano.',
    )
    icono = models.CharField(
        'Icono', max_length=50, default='ShieldCheck',
        help_text='Nombre exacto de un icono de Lucide (https://lucide.dev/icons). Ejemplos: Shield, Star, Zap, Heart, Users, Award.',
    )
    orden = models.PositiveIntegerField(
        'Orden', default=0,
        help_text='Menor número aparece primero en el carrusel.',
        db_index=True,
    )
    activo = models.BooleanField(
        'Visible en el sitio', default=True,
        help_text='Desmarca para ocultar este valor sin borrarlo.',
        db_index=True,
    )

    class Meta:
        verbose_name = 'Valor / Beneficio'
        verbose_name_plural = 'Valores / Beneficios'
        ordering = ['orden']

    def __str__(self):
        return self.titulo
