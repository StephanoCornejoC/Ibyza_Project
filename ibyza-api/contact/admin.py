from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from unfold.admin import ModelAdmin
from .models import SolicitudContacto, SolicitudCita


@admin.register(SolicitudContacto)
class SolicitudContactoAdmin(ModelAdmin):
    list_display = (
        'estado_lectura',
        'nombre_completo',
        'email',
        'telefono',
        'proyecto_interes',
        'mensaje_corto',
        'recibido_en',
    )
    list_display_links = ('nombre_completo',)
    list_filter = ('leido', 'recibido_en')
    search_fields = ('nombre', 'apellido', 'email', 'telefono', 'mensaje')
    list_editable = ('proyecto_interes',)  # quitamos leido para usar action
    readonly_fields = ('recibido_en',)
    date_hierarchy = 'recibido_en'
    actions = ['marcar_leido', 'marcar_no_leido']
    save_on_top = True

    fieldsets = (
        ('Cliente', {
            'fields': ('nombre', 'apellido', 'email', 'telefono'),
        }),
        ('Mensaje', {
            'fields': ('proyecto_interes', 'mensaje'),
        }),
        ('Seguimiento', {
            'fields': ('leido', 'recibido_en'),
        }),
    )

    @admin.display(description='Estado', ordering='leido')
    def estado_lectura(self, obj):
        if obj.leido:
            return mark_safe('<span style="color:#22c55e;font-weight:700;font-size:13px">✓ Leído</span>')
        return mark_safe('<span style="color:#ef4444;font-weight:700;font-size:13px">● Nuevo</span>')

    @admin.display(description='Nombre')
    def nombre_completo(self, obj):
        return f'{obj.nombre} {obj.apellido}'

    @admin.display(description='Mensaje')
    def mensaje_corto(self, obj):
        if obj.mensaje:
            preview = obj.mensaje[:80] + '…' if len(obj.mensaje) > 80 else obj.mensaje
            return format_html('<span title="{}">{}</span>', obj.mensaje, preview)
        return '—'

    @admin.action(description='✓ Marcar seleccionados como leídos')
    def marcar_leido(self, request, queryset):
        updated = queryset.update(leido=True)
        self.message_user(request, f'{updated} mensaje(s) marcado(s) como leído(s).')

    @admin.action(description='● Marcar seleccionados como NO leídos')
    def marcar_no_leido(self, request, queryset):
        updated = queryset.update(leido=False)
        self.message_user(request, f'{updated} mensaje(s) marcado(s) como NO leído(s).')

    def get_form(self, request, obj=None, **kwargs):
        # Auto-marcar como leído al abrir el detalle (si no lo estaba)
        if obj is not None and not obj.leido:
            obj.leido = True
            obj.save(update_fields=['leido'])
        return super().get_form(request, obj, **kwargs)


@admin.register(SolicitudCita)
class SolicitudCitaAdmin(ModelAdmin):
    list_display = (
        'nombre_completo',
        'tipo_badge',
        'fecha_preferida',
        'estado_badge',
        'email',
        'telefono',
        'recibido_en',
    )
    list_display_links = ('nombre_completo',)
    list_filter = ('tipo', 'estado', 'fecha_preferida')
    search_fields = ('nombre', 'apellido', 'email', 'telefono')
    readonly_fields = ('recibido_en',)
    date_hierarchy = 'fecha_preferida'
    actions = ['confirmar_citas', 'cancelar_citas']
    save_on_top = True

    fieldsets = (
        ('Cliente', {
            'fields': ('nombre', 'apellido', 'email', 'telefono'),
        }),
        ('Cita solicitada', {
            'fields': ('tipo', 'fecha_preferida', 'mensaje'),
        }),
        ('Seguimiento', {
            'fields': ('estado', 'recibido_en'),
        }),
    )

    @admin.display(description='Cliente')
    def nombre_completo(self, obj):
        return f'{obj.nombre} {obj.apellido}'

    @admin.display(description='Tipo', ordering='tipo')
    def tipo_badge(self, obj):
        colores = {'presencial': '#0ea5e9', 'virtual': '#8b5cf6'}
        iconos = {'presencial': '🏢', 'virtual': '💻'}
        color = colores.get(obj.tipo, '#6b7280')
        icono = iconos.get(obj.tipo, '')
        return format_html(
            '<span style="background:{};color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600">{} {}</span>',
            color, icono, obj.get_tipo_display(),
        )

    @admin.display(description='Estado', ordering='estado')
    def estado_badge(self, obj):
        colores = {
            'pendiente': '#f59e0b',
            'confirmada': '#22c55e',
            'cancelada': '#ef4444',
        }
        color = colores.get(obj.estado, '#6b7280')
        return format_html(
            '<span style="background:{};color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600">{}</span>',
            color, obj.get_estado_display(),
        )

    @admin.action(description='✓ Confirmar citas seleccionadas')
    def confirmar_citas(self, request, queryset):
        updated = queryset.filter(estado='pendiente').update(estado='confirmada')
        self.message_user(request, f'{updated} cita(s) confirmada(s).')

    @admin.action(description='✗ Cancelar citas seleccionadas')
    def cancelar_citas(self, request, queryset):
        updated = queryset.exclude(estado='cancelada').update(estado='cancelada')
        self.message_user(request, f'{updated} cita(s) cancelada(s).')
