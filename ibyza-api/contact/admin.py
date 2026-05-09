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
    readonly_fields = ('recibido_en',)
    date_hierarchy = 'recibido_en'
    ordering = ('-recibido_en',)
    actions = ['marcar_leido', 'marcar_no_leido']
    save_on_top = True

    fieldsets = (
        ('Datos del cliente', {
            'description': 'Persona que envió el mensaje desde el formulario de contacto del sitio.',
            'fields': ('nombre', 'apellido', 'email', 'telefono'),
        }),
        ('Mensaje recibido', {
            'fields': ('proyecto_interes', 'mensaje'),
        }),
        ('Seguimiento', {
            'description': 'Marcá "Leído" cuando ya hayas atendido al cliente.',
            'fields': ('leido', 'recibido_en'),
        }),
    )

    @admin.display(description='Estado', ordering='leido')
    def estado_lectura(self, obj):
        if obj.leido:
            return mark_safe('<span style="color:#22c55e;font-weight:700;font-size:13px">Leido</span>')
        return mark_safe('<span style="color:#ef4444;font-weight:700;font-size:13px">Nuevo</span>')

    @admin.display(description='Nombre')
    def nombre_completo(self, obj):
        return f'{obj.nombre} {obj.apellido}'

    @admin.display(description='Mensaje')
    def mensaje_corto(self, obj):
        if obj.mensaje:
            preview = obj.mensaje[:80] + '…' if len(obj.mensaje) > 80 else obj.mensaje
            return format_html('<span title="{}">{}</span>', obj.mensaje, preview)
        return '—'

    @admin.action(description='Marcar seleccionados como leidos')
    def marcar_leido(self, request, queryset):
        updated = queryset.update(leido=True)
        self.message_user(request, f'{updated} mensaje(s) marcado(s) como leido(s).')

    @admin.action(description='Marcar seleccionados como NO leidos')
    def marcar_no_leido(self, request, queryset):
        updated = queryset.update(leido=False)
        self.message_user(request, f'{updated} mensaje(s) marcado(s) como NO leido(s).')


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
    ordering = ('-recibido_en',)
    actions = ['confirmar_citas', 'cancelar_citas']
    save_on_top = True

    fieldsets = (
        ('Datos del cliente', {
            'description': 'Persona que solicitó la cita desde el formulario del sitio.',
            'fields': ('nombre', 'apellido', 'email', 'telefono'),
        }),
        ('Cita solicitada', {
            'description': 'Fecha, tipo de cita y mensaje opcional que dejó el cliente.',
            'fields': ('tipo', 'fecha_preferida', 'mensaje'),
        }),
        ('Seguimiento', {
            'description': 'Cambiá el estado a "Confirmada" cuando ya hayas agendado la reunión con el cliente.',
            'fields': ('estado', 'recibido_en'),
        }),
    )

    @admin.display(description='Cliente')
    def nombre_completo(self, obj):
        return f'{obj.nombre} {obj.apellido}'

    @admin.display(description='Tipo', ordering='tipo')
    def tipo_badge(self, obj):
        colores = {'presencial': '#0ea5e9', 'virtual': '#8b5cf6'}
        color = colores.get(obj.tipo, '#6b7280')
        return format_html(
            '<span style="background:{};color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600">{}</span>',
            color, obj.get_tipo_display(),
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

    @admin.action(description='Confirmar citas seleccionadas')
    def confirmar_citas(self, request, queryset):
        # Iteramos para que dispare post_save (y futuros signals como
        # envio de email de confirmacion al cliente).
        elegibles = queryset.filter(estado='pendiente')
        updated = 0
        for cita in elegibles:
            cita.estado = 'confirmada'
            cita.save(update_fields=['estado'])
            updated += 1
        self.message_user(request, f'{updated} cita(s) confirmada(s).')

    @admin.action(description='Cancelar citas seleccionadas')
    def cancelar_citas(self, request, queryset):
        elegibles = queryset.exclude(estado='cancelada')
        updated = 0
        for cita in elegibles:
            cita.estado = 'cancelada'
            cita.save(update_fields=['estado'])
            updated += 1
        self.message_user(request, f'{updated} cita(s) cancelada(s).')
