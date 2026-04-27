from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from unfold.admin import ModelAdmin
from .models import Separacion


@admin.register(Separacion)
class SeparacionAdmin(ModelAdmin):
    list_display = (
        'estado_badge',
        'nombre_completo',
        'departamento_link',
        'monto_formato',
        'metodo_badge',
        'tiene_comprobante',
        'registrado_en',
    )
    list_display_links = ('nombre_completo',)
    list_filter = ('estado', 'metodo_pago', 'registrado_en')
    search_fields = ('nombre', 'apellido', 'dni', 'email', 'telefono')
    readonly_fields = (
        'culqi_charge_id', 'error', 'registrado_en',
        'comprobante_preview',
    )
    date_hierarchy = 'registrado_en'
    actions = ['aprobar_transferencia', 'rechazar_transferencia']
    save_on_top = True

    fieldsets = (
        ('👤 Datos del comprador', {
            'fields': (
                'departamento',
                ('nombre', 'apellido'),
                ('email', 'telefono'),
                ('dni', 'monto'),
            ),
        }),
        ('💳 Información de pago', {
            'fields': (
                ('metodo_pago', 'estado'),
                'culqi_charge_id',
                'comprobante',
                'comprobante_preview',
                'error',
            ),
        }),
        ('📅 Registro', {
            'fields': ('registrado_en',),
        }),
    )

    @admin.display(description='Cliente')
    def nombre_completo(self, obj):
        return format_html(
            '<strong>{} {}</strong><br><span style="color:#9ca3af;font-size:11px">DNI: {}</span>',
            obj.nombre, obj.apellido, obj.dni or '—',
        )

    @admin.display(description='Departamento')
    def departamento_link(self, obj):
        return format_html(
            '<span title="{}">{}</span>',
            obj.departamento, obj.departamento.codigo,
        )

    @admin.display(description='Monto', ordering='monto')
    def monto_formato(self, obj):
        return format_html('<strong>S/ {}</strong>', f'{obj.monto:,.2f}')

    @admin.display(description='Estado', ordering='estado')
    def estado_badge(self, obj):
        config = {
            'pendiente': ('#f59e0b', '⏳ Pendiente'),
            'completado': ('#22c55e', '✓ Aprobada'),
            'fallido': ('#ef4444', '✗ Rechazada'),
        }
        color, label = config.get(obj.estado, ('#6b7280', obj.estado))
        return format_html(
            '<span style="background:{};color:#fff;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:700">{}</span>',
            color, label,
        )

    @admin.display(description='Método', ordering='metodo_pago')
    def metodo_badge(self, obj):
        config = {
            'culqi': ('#6366f1', '💳 Tarjeta'),
            'transferencia': ('#0ea5e9', '🏦 Transferencia'),
        }
        color, label = config.get(obj.metodo_pago, ('#6b7280', obj.metodo_pago))
        return format_html(
            '<span style="background:{};color:#fff;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600">{}</span>',
            color, label,
        )

    @admin.display(description='Comprobante')
    def tiene_comprobante(self, obj):
        if obj.metodo_pago != 'transferencia':
            return mark_safe('<span style="color:#9ca3af">N/A</span>')
        if obj.comprobante:
            return format_html(
                '<a href="{}" target="_blank" style="color:#22c55e;font-weight:600">📎 Ver</a>',
                obj.comprobante.url,
            )
        return mark_safe('<span style="color:#ef4444">⚠ Falta</span>')

    @admin.display(description='Vista previa del comprobante')
    def comprobante_preview(self, obj):
        if obj.comprobante:
            return format_html(
                '<a href="{}" target="_blank">'
                '<img src="{}" style="max-width:400px;max-height:300px;border-radius:8px;border:1px solid #e5e7eb" />'
                '</a>'
                '<p style="margin-top:8px;color:#6b7280;font-size:12px">Click en la imagen para abrirla en grande.</p>',
                obj.comprobante.url, obj.comprobante.url,
            )
        return mark_safe('<span style="color:#9ca3af">Sin comprobante</span>')

    @admin.action(description='✓ Aprobar transferencia (marca depto como SEPARADO)')
    def aprobar_transferencia(self, request, queryset):
        elegibles = queryset.filter(estado='pendiente', metodo_pago='transferencia')
        descartadas = queryset.count() - elegibles.count()
        updated = 0
        for sep in elegibles:
            sep.estado = 'completado'
            sep.save(update_fields=['estado'])
            sep.departamento.estado = 'separado'
            sep.departamento.save(update_fields=['estado'])
            updated += 1
        msg = f'{updated} separación(es) aprobada(s) y departamento(s) marcado(s) como SEPARADO.'
        if descartadas:
            msg += f' ({descartadas} ignorada(s) por no ser transferencias pendientes.)'
        self.message_user(request, msg)

    @admin.action(description='✗ Rechazar transferencia (libera el departamento)')
    def rechazar_transferencia(self, request, queryset):
        from django.contrib import messages
        if 'apply' not in request.POST:
            # Mostrar confirmación
            from django.template.response import TemplateResponse
            elegibles = queryset.filter(estado='pendiente', metodo_pago='transferencia')
            return TemplateResponse(request, 'admin/payments/confirmar_rechazo.html', {
                'separaciones': elegibles,
                'queryset': queryset,
                'action': 'rechazar_transferencia',
                'opts': self.model._meta,
            })
        elegibles = queryset.filter(estado='pendiente', metodo_pago='transferencia')
        updated = elegibles.update(estado='fallido')
        self.message_user(
            request,
            f'{updated} separación(es) rechazada(s).',
            level=messages.WARNING,
        )

    def get_queryset(self, request):
        # Optimización: pre-cargar departamento y proyecto
        return super().get_queryset(request).select_related(
            'departamento__nivel__proyecto',
        )
