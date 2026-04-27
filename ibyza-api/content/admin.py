from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin
from .models import ContenidoWeb, ConfiguracionSitio, PreguntaFrecuente, Testimonio, Beneficio


@admin.register(ContenidoWeb)
class ContenidoWebAdmin(ModelAdmin):
    list_display = (
        'thumbnail',
        'get_seccion_display',
        'clave',
        'preview_texto',
        'activo',
    )
    list_display_links = ('thumbnail', 'clave')
    list_filter = ('seccion', 'activo')
    search_fields = ('clave', 'valor')
    list_editable = ('activo',)
    save_on_top = True

    @admin.display(description='Sección', ordering='seccion')
    def get_seccion_display(self, obj):
        return obj.get_seccion_display()

    @admin.display(description='Texto')
    def preview_texto(self, obj):
        if not obj.valor:
            return format_html('<span style="color:#9ca3af">— sin texto —</span>')
        preview = obj.valor[:80] + '…' if len(obj.valor) > 80 else obj.valor
        return format_html('<span title="{}">{}</span>', obj.valor, preview)

    @admin.display(description='Imagen')
    def thumbnail(self, obj):
        if obj.imagen:
            return format_html(
                '<img src="{}" style="width:50px;height:38px;object-fit:cover;border-radius:6px;" />',
                obj.imagen.url,
            )
        return format_html(
            '<div style="width:50px;height:38px;background:#f3f4f6;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:18px;">📝</div>',
        )


@admin.register(ConfiguracionSitio)
class ConfiguracionSitioAdmin(ModelAdmin):
    save_on_top = True
    fieldsets = (
        ('📞 Datos de contacto', {
            'description': 'Estos datos aparecen en el footer y en la página de contacto del sitio.',
            'fields': ('direccion', 'telefono', 'email', 'horario', 'whatsapp'),
        }),
        ('🌐 Redes sociales', {
            'description': 'Pega las URL completas. Deja en blanco las redes que no uses.',
            'fields': ('facebook_url', 'instagram_url', 'tiktok_url', 'linkedin_url', 'youtube_url'),
        }),
        ('🏷️ Branding', {
            'description': 'Slogan y descripción que se usan en SEO y secciones del sitio.',
            'fields': ('slogan', 'descripcion_empresa'),
        }),
    )

    def has_add_permission(self, request):
        # Solo permitir 1 registro
        return not ConfiguracionSitio.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        # Si solo hay una configuración, redirigir directamente al edit
        from django.shortcuts import redirect
        config = ConfiguracionSitio.objects.first()
        if config:
            return redirect(
                f'/admin/content/configuracionsitio/{config.pk}/change/',
            )
        return super().changelist_view(request, extra_context)


@admin.register(PreguntaFrecuente)
class PreguntaFrecuenteAdmin(ModelAdmin):
    list_display = ('pregunta_corta', 'orden', 'activo')
    list_display_links = ('pregunta_corta',)
    list_filter = ('activo',)
    search_fields = ('pregunta', 'respuesta')
    list_editable = ('orden', 'activo')

    @admin.display(description='Pregunta')
    def pregunta_corta(self, obj):
        return obj.pregunta[:80] + '…' if len(obj.pregunta) > 80 else obj.pregunta


@admin.register(Testimonio)
class TestimonioAdmin(ModelAdmin):
    list_display = ('foto_thumb', 'nombre', 'cargo', 'proyecto', 'estrellas', 'orden', 'activo')
    list_display_links = ('foto_thumb', 'nombre')
    list_filter = ('activo', 'calificacion', 'proyecto')
    search_fields = ('nombre', 'cargo', 'testimonio')
    list_editable = ('orden', 'activo')
    autocomplete_fields = ('proyecto',)

    @admin.display(description='Foto')
    def foto_thumb(self, obj):
        if obj.foto:
            return format_html(
                '<img src="{}" style="width:42px;height:42px;object-fit:cover;border-radius:50%;" />',
                obj.foto.url,
            )
        return format_html(
            '<div style="width:42px;height:42px;background:#f3f4f6;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-weight:700">{}</div>',
            obj.nombre[0].upper() if obj.nombre else '?',
        )

    @admin.display(description='Calificación', ordering='calificacion')
    def estrellas(self, obj):
        return format_html(
            '<span style="color:#f59e0b;font-size:14px;letter-spacing:1px">{}</span>',
            '★' * obj.calificacion + '☆' * (5 - obj.calificacion),
        )


@admin.register(Beneficio)
class BeneficioAdmin(ModelAdmin):
    list_display = ('icono_preview', 'titulo', 'descripcion_corta', 'orden', 'activo')
    list_display_links = ('icono_preview', 'titulo')
    list_filter = ('activo',)
    search_fields = ('titulo', 'descripcion')
    list_editable = ('orden', 'activo')

    @admin.display(description='Icono')
    def icono_preview(self, obj):
        return format_html(
            '<code style="background:#f3f4f6;padding:4px 8px;border-radius:4px;font-size:11px">{}</code>',
            obj.icono,
        )

    @admin.display(description='Descripción')
    def descripcion_corta(self, obj):
        if len(obj.descripcion) > 100:
            return obj.descripcion[:100] + '…'
        return obj.descripcion
