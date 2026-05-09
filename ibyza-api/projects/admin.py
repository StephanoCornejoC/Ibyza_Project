from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
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
    """Listado de Departamentos dentro de un Nivel.

    El estado es READONLY: solo se cambia creando/editando una Separación.
    Los deptos nuevos se crean siempre con estado 'disponible' (default
    del modelo).
    """
    model = Departamento
    extra = 0
    fields = ('codigo', 'tipo', 'area_total', 'area_techada', 'precio', 'estado_display')
    readonly_fields = ('estado_display',)
    verbose_name = 'Departamento'
    verbose_name_plural = 'Departamentos de este piso'

    @admin.display(description='Estado')
    def estado_display(self, obj):
        if not obj or not obj.pk:
            return '—'
        return obj.get_estado_display()


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
        ('Información principal', {
            'description': 'Datos básicos del proyecto. Todo lo de aquí es lo más importante para que aparezca en la web.',
            'fields': ('nombre', 'slug', 'estado', 'precio_desde', 'orden', 'activo'),
        }),
        ('Descripción y ubicación', {
            'description': 'Texto que verán los clientes en el listado y en la página de detalle del proyecto.',
            'fields': ('descripcion_corta', 'descripcion', 'ubicacion', 'google_maps_embed'),
        }),
        ('Imágenes y archivos', {
            'description': 'Foto principal de la fachada, render del edificio y catálogo descargable. Recomendado 1200x800 px.',
            'fields': ('imagen_fachada', 'imagen_isometrico', 'catalogo_pdf'),
        }),
        ('Datos bancarios para transferencia', {
            'classes': ('collapse',),
            'description': 'Estos datos se mostrarán al cliente cuando elija pagar la separación por transferencia bancaria. Solo completalos si este proyecto recibe pagos por transferencia.',
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
        return mark_safe(
            '<div style="width:60px;height:45px;background:#e5e7eb;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:11px;">Sin foto</div>'
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
        return mark_safe('<span style="color:#9ca3af">—</span>')

    @admin.display(description='Deptos')
    def departamentos_count(self, obj):
        total = sum(n.departamentos.count() for n in obj.niveles.all())
        disponibles = sum(
            n.departamentos.filter(estado='disponible').count()
            for n in obj.niveles.all()
        )
        if total == 0:
            return mark_safe('<span style="color:#9ca3af">—</span>')
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
    autocomplete_fields = ('proyecto',)
    ordering = ('proyecto__nombre', 'numero')
    save_on_top = True
    inlines = [DepartamentoInline]

    @admin.display(description='Departamentos')
    def departamentos_count(self, obj):
        return obj.departamentos.count()


# ─── Departamento ───────────────────────────────────────────────────────────

@admin.register(Departamento)
class DepartamentoAdmin(ModelAdmin):
    list_display = (
        'codigo', 'get_proyecto', 'get_nivel', 'tipo',
        'area_total', 'precio_formato', 'estado_badge', 'codigo_acceso_display',
    )
    list_filter = ('estado', 'tipo', 'nivel__proyecto', 'codigo_activo')
    search_fields = ('codigo', 'nivel__proyecto__nombre', 'codigo_acceso')
    list_editable = ()
    autocomplete_fields = ('nivel',)
    ordering = ('nivel__proyecto__nombre', 'nivel__numero', 'codigo')
    save_on_top = True
    readonly_fields = ('codigo_acceso', 'estado')
    actions = ('regenerar_codigo_acceso',)

    fieldsets = (
        ('Ubicación dentro del proyecto', {
            'description': 'Indica en qué piso del proyecto está este departamento.',
            'fields': ('nivel', 'codigo', 'tipo'),
        }),
        ('Áreas y precio', {
            'fields': ('area_total', 'area_techada', 'precio'),
        }),
        ('Estado de venta (gestionado por separaciones)', {
            'description': (
                'El estado se actualiza automáticamente según las separaciones registradas. '
                'Para cambiarlo, registrá una separación en "Separaciones recibidas".'
            ),
            'fields': ('estado',),
        }),
        ('Descripción y plano', {
            'fields': ('descripcion', 'imagen_planta'),
        }),
        ('Acceso del comprador', {
            'classes': ('collapse',),
            'description': 'Cuando el departamento se marque como "separado" o "vendido" se generará '
                           'un código único. Compártelo con el comprador para que pueda ver el avance '
                           'de obra de su proyecto en /avance/<código>.',
            'fields': ('codigo_acceso', 'codigo_activo'),
        }),
    )

    def get_readonly_fields(self, request, obj=None):
        """`estado` siempre readonly: se gestiona vía Separaciones."""
        base = list(super().get_readonly_fields(request, obj))
        if 'estado' not in base:
            base.append('estado')
        return base

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

    @admin.display(description='Código de acceso', ordering='codigo_acceso')
    def codigo_acceso_display(self, obj):
        if not obj.codigo_acceso:
            return mark_safe('<span style="color:#9ca3af">—</span>')
        if not obj.codigo_activo:
            return format_html(
                '<code style="font-family:monospace;background:#fee2e2;color:#991b1b;'
                'padding:2px 6px;border-radius:4px;text-decoration:line-through">{}</code>',
                obj.codigo_acceso,
            )
        return format_html(
            '<code style="font-family:monospace;background:#f3f4f6;color:#111827;'
            'padding:2px 6px;border-radius:4px">{}</code>',
            obj.codigo_acceso,
        )

    @admin.action(description='Regenerar código de acceso')
    def regenerar_codigo_acceso(self, request, queryset):
        # Pantalla de confirmacion previa: avisa que el comprador anterior
        # pierde acceso a /avance/<codigo> sin aviso.
        if 'apply' not in request.POST:
            from django.template.response import TemplateResponse
            elegibles = queryset.filter(estado__in=['separado', 'vendido'])
            return TemplateResponse(
                request,
                'admin/projects/confirmar_regenerar_codigo.html',
                {
                    'departamentos': elegibles,
                    'queryset': queryset,
                    'action': 'regenerar_codigo_acceso',
                    'opts': self.model._meta,
                },
            )

        elegibles = queryset.filter(estado__in=['separado', 'vendido'])
        regenerados = 0
        for depto in elegibles:
            depto.codigo_acceso = None
            depto.save()
            if depto.codigo_acceso:
                regenerados += 1
        descartados = queryset.count() - elegibles.count()
        msg = f'Se regeneraron {regenerados} código(s) de acceso.'
        if descartados:
            msg += f' ({descartados} ignorado(s) por estar en estado "disponible".)'
        self.message_user(request, msg)


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
    ordering = ('-fecha',)
    save_on_top = True

    fieldsets = (
        ('Datos del avance', {
            'description': 'A qué proyecto corresponde este avance, qué se hizo y cuándo.',
            'fields': ('proyecto', 'titulo', 'fecha', 'publicado'),
        }),
        ('Contenido', {
            'description': 'Texto y foto que verán los clientes en la sección de avances de obra.',
            'fields': ('contenido', 'imagen'),
        }),
    )

    @admin.display(description='Foto')
    def thumbnail(self, obj):
        if obj.imagen:
            return format_html(
                '<img src="{}" style="width:60px;height:45px;object-fit:cover;border-radius:6px;" />',
                obj.imagen.url,
            )
        return mark_safe('<span style="color:#9ca3af">—</span>')


# ─── Video y Galería (registrados para autocomplete y admin) ────────────────

@admin.register(VideoProyecto)
class VideoProyectoAdmin(ModelAdmin):
    list_display = ('titulo', 'proyecto', 'orden')
    list_filter = ('proyecto',)
    search_fields = ('titulo', 'proyecto__nombre')
    list_editable = ('orden',)
    autocomplete_fields = ('proyecto',)
    ordering = ('proyecto__nombre', 'orden')
    save_on_top = True


@admin.register(ImagenGaleria)
class ImagenGaleriaAdmin(ModelAdmin):
    list_display = ('thumbnail', 'proyecto', 'descripcion', 'orden')
    list_display_links = ('thumbnail', 'descripcion')
    list_filter = ('proyecto',)
    search_fields = ('descripcion', 'proyecto__nombre')
    list_editable = ('orden',)
    autocomplete_fields = ('proyecto',)
    ordering = ('proyecto__nombre', 'orden')
    save_on_top = True

    @admin.display(description='Imagen')
    def thumbnail(self, obj):
        if obj.imagen:
            return format_html(
                '<img src="{}" style="width:60px;height:45px;object-fit:cover;border-radius:6px;" />',
                obj.imagen.url,
            )
        return mark_safe('<span style="color:#9ca3af">—</span>')
