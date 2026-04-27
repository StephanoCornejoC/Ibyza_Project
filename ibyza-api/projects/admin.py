from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline
from .models import Proyecto, Nivel, Departamento, AvanceDeObra, VideoProyecto, ImagenGaleria


# ─── Inlines ────────────────────────────────────────────────────────────────

class VideoInline(TabularInline):
    model = VideoProyecto
    extra = 0
    fields = ('titulo', 'youtube_url', 'orden')
    verbose_name = 'Video'
    verbose_name_plural = 'Videos del proyecto'


class GaleriaInline(TabularInline):
    model = ImagenGaleria
    extra = 0
    fields = ('imagen', 'descripcion', 'orden')
    verbose_name = 'Foto'
    verbose_name_plural = 'Galería de fotos'


class NivelInline(TabularInline):
    model = Nivel
    extra = 0
    fields = ('numero', 'nombre', 'imagen_planta', 'orden')
    verbose_name = 'Piso'
    verbose_name_plural = 'Pisos del proyecto'


class DepartamentoInline(TabularInline):
    model = Departamento
    extra = 0
    fields = ('codigo', 'tipo', 'area_total', 'area_techada', 'precio', 'estado')
    verbose_name = 'Departamento'
    verbose_name_plural = 'Departamentos de este piso'


# ─── Proyecto ───────────────────────────────────────────────────────────────

@admin.register(Proyecto)
class ProyectoAdmin(ModelAdmin):
    list_display = (
        'thumbnail',
        'nombre',
        'estado_badge',
        'ubicacion',
        'precio_formato',
        'departamentos_count',
        'activo',
    )
    list_display_links = ('thumbnail', 'nombre')
    list_filter = ('estado', 'activo')
    search_fields = ('nombre', 'ubicacion')
    list_editable = ('activo',)
    prepopulated_fields = {'slug': ('nombre',)}
    inlines = [NivelInline, VideoInline, GaleriaInline]
    save_on_top = True

    fieldsets = (
        ('📝 Información principal', {
            'fields': ('nombre', 'slug', 'estado', 'precio_desde', 'orden', 'activo'),
        }),
        ('📄 Descripción', {
            'fields': ('descripcion_corta', 'descripcion', 'ubicacion', 'google_maps_embed'),
        }),
        ('🖼️ Imágenes y archivos', {
            'fields': ('imagen_fachada', 'imagen_isometrico', 'catalogo_pdf'),
        }),
        ('🏦 Datos bancarios para transferencia', {
            'classes': ('collapse',),
            'description': 'Estos datos se mostrarán al cliente cuando elija pagar la separación por transferencia bancaria.',
            'fields': (
                'empresa_receptora', 'empresa_ruc', 'empresa_banco',
                'cuenta_soles', 'cci_soles',
                'cuenta_dolares', 'cci_dolares',
            ),
        }),
    )

    @admin.display(description='Foto')
    def thumbnail(self, obj):
        if obj.imagen_fachada:
            return format_html(
                '<img src="{}" style="width:60px;height:45px;object-fit:cover;border-radius:6px;" />',
                obj.imagen_fachada.url,
            )
        return format_html(
            '<div style="width:60px;height:45px;background:#e5e7eb;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:11px;">Sin foto</div>',
        )

    @admin.display(description='Estado', ordering='estado')
    def estado_badge(self, obj):
        colores = {
            'en_venta': ('#22c55e', 'En Venta'),
            'preventa': ('#f59e0b', 'Preventa'),
            'en_construccion': ('#3b82f6', 'En Construcción'),
            'vendido': ('#6b7280', 'Vendido'),
        }
        color, label = colores.get(obj.estado, ('#6b7280', obj.estado))
        return format_html(
            '<span style="background:{};color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600">{}</span>',
            color, label,
        )

    @admin.display(description='Precio desde', ordering='precio_desde')
    def precio_formato(self, obj):
        if obj.precio_desde:
            return format_html('<strong>S/ {}</strong>', f'{obj.precio_desde:,.0f}')
        return format_html('<span style="color:#9ca3af">—</span>')

    @admin.display(description='Deptos')
    def departamentos_count(self, obj):
        total = sum(n.departamentos.count() for n in obj.niveles.all())
        disponibles = sum(
            n.departamentos.filter(estado='disponible').count()
            for n in obj.niveles.all()
        )
        if total == 0:
            return format_html('<span style="color:#9ca3af">—</span>')
        return format_html(
            '<span title="{} disponibles de {} en total">{} / {}</span>',
            disponibles, total, disponibles, total,
        )


# ─── Nivel ──────────────────────────────────────────────────────────────────

@admin.register(Nivel)
class NivelAdmin(ModelAdmin):
    list_display = ('proyecto', 'numero', 'nombre', 'departamentos_count')
    list_filter = ('proyecto',)
    search_fields = ('proyecto__nombre', 'nombre')
    inlines = [DepartamentoInline]

    @admin.display(description='Departamentos')
    def departamentos_count(self, obj):
        return obj.departamentos.count()


# ─── Departamento ───────────────────────────────────────────────────────────

@admin.register(Departamento)
class DepartamentoAdmin(ModelAdmin):
    list_display = (
        'codigo', 'get_proyecto', 'get_nivel', 'tipo',
        'area_total', 'precio_formato', 'estado_badge',
    )
    list_filter = ('estado', 'tipo', 'nivel__proyecto')
    search_fields = ('codigo', 'nivel__proyecto__nombre')
    list_editable = ()
    autocomplete_fields = ('nivel',)

    @admin.display(description='Proyecto', ordering='nivel__proyecto__nombre')
    def get_proyecto(self, obj):
        return obj.nivel.proyecto.nombre

    @admin.display(description='Piso', ordering='nivel__numero')
    def get_nivel(self, obj):
        return f'Piso {obj.nivel.numero}'

    @admin.display(description='Precio', ordering='precio')
    def precio_formato(self, obj):
        return format_html('<strong>S/ {}</strong>', f'{obj.precio:,.0f}')

    @admin.display(description='Estado', ordering='estado')
    def estado_badge(self, obj):
        colores = {
            'disponible': '#22c55e',
            'separado': '#f59e0b',
            'vendido': '#ef4444',
        }
        color = colores.get(obj.estado, '#6b7280')
        return format_html(
            '<span style="background:{};color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600">{}</span>',
            color, obj.get_estado_display(),
        )


# ─── Avance de obra ─────────────────────────────────────────────────────────

@admin.register(AvanceDeObra)
class AvanceDeObraAdmin(ModelAdmin):
    list_display = ('thumbnail', 'titulo', 'proyecto', 'fecha', 'publicado')
    list_display_links = ('thumbnail', 'titulo')
    list_filter = ('proyecto', 'publicado')
    search_fields = ('titulo', 'proyecto__nombre')
    list_editable = ('publicado',)
    date_hierarchy = 'fecha'
    autocomplete_fields = ('proyecto',)

    @admin.display(description='Foto')
    def thumbnail(self, obj):
        if obj.imagen:
            return format_html(
                '<img src="{}" style="width:60px;height:45px;object-fit:cover;border-radius:6px;" />',
                obj.imagen.url,
            )
        return format_html('<span style="color:#9ca3af">—</span>')


# ─── Video y Galería (registrados para autocomplete y admin) ────────────────

@admin.register(VideoProyecto)
class VideoProyectoAdmin(ModelAdmin):
    list_display = ('titulo', 'proyecto', 'orden')
    list_filter = ('proyecto',)
    search_fields = ('titulo', 'proyecto__nombre')
    list_editable = ('orden',)
    autocomplete_fields = ('proyecto',)


@admin.register(ImagenGaleria)
class ImagenGaleriaAdmin(ModelAdmin):
    list_display = ('thumbnail', 'proyecto', 'descripcion', 'orden')
    list_display_links = ('thumbnail', 'descripcion')
    list_filter = ('proyecto',)
    search_fields = ('descripcion', 'proyecto__nombre')
    list_editable = ('orden',)
    autocomplete_fields = ('proyecto',)

    @admin.display(description='Imagen')
    def thumbnail(self, obj):
        if obj.imagen:
            return format_html(
                '<img src="{}" style="width:60px;height:45px;object-fit:cover;border-radius:6px;" />',
                obj.imagen.url,
            )
        return format_html('<span style="color:#9ca3af">—</span>')
