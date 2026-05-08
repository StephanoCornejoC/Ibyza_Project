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
        'origen_badge',
        'tiene_comprobante',
        'registrado_en',
    )
    list_display_links = ('nombre_completo',)
    list_filter = ('estado', 'metodo_pago', 'origen', 'registrado_en')
    search_fields = (
        'nombre', 'apellido', 'dni', 'email', 'telefono', 'numero_operacion',
    )
    readonly_fields = (
        'culqi_charge_id', 'error', 'registrado_en',
        'comprobante_preview',
    )
    date_hierarchy = 'registrado_en'
    actions = ['aprobar_transferencia', 'rechazar_transferencia']
    save_on_top = True

    fieldsets = (
        ('Datos del comprador', {
            'description': 'Cliente que realizó la separación. El departamento se asocia automáticamente desde el formulario web o se elige al registrar manualmente.',
            'fields': (
                'departamento',
                ('nombre', 'apellido'),
                ('email', 'telefono'),
                ('dni', 'monto'),
            ),
        }),
        ('Método y monto', {
            'description': (
                'Tarjeta (Culqi) se aprueba automáticamente. Transferencia, '
                'efectivo y cheque requieren aprobación manual desde la lista '
                '(acción "Aprobar transferencia").'
            ),
            'fields': (
                ('metodo_pago', 'estado'),
                ('origen', 'numero_operacion'),
                'culqi_charge_id',
            ),
        }),
        ('Comprobante', {
            'description': (
                'Adjuntá el voucher, comprobante de transferencia, foto de '
                'recibo de efectivo o imagen del cheque. No aplica para Culqi '
                '(ya tiene su ID de transacción).'
            ),
            'fields': (
                'comprobante',
                'comprobante_preview',
            ),
        }),
        ('Notas internas', {
            'classes': ('collapse',),
            'description': 'Notas privadas del equipo. No se muestran al comprador.',
            'fields': ('notas_admin',),
        }),
        ('Diagnóstico', {
            'classes': ('collapse',),
            'fields': ('error', 'registrado_en'),
        }),
    )

    def get_changeform_initial_data(self, request):
        """Cuando Diana crea una Separación desde admin, origen='admin' por default."""
        initial = super().get_changeform_initial_data(request)
        initial.setdefault('origen', 'admin')
        return initial

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
            'pendiente': ('#f59e0b', 'Pendiente'),
            'completado': ('#22c55e', 'Aprobada'),
            'fallido': ('#ef4444', 'Rechazada'),
        }
        color, label = config.get(obj.estado, ('#6b7280', obj.estado))
        return format_html(
            '<span style="background:{};color:#fff;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:700">{}</span>',
            color, label,
        )

    @admin.display(description='Método', ordering='metodo_pago')
    def metodo_badge(self, obj):
        config = {
            'culqi': ('#6366f1', 'Tarjeta'),
            'transferencia': ('#0ea5e9', 'Transferencia'),
            'efectivo': ('#16a34a', 'Efectivo'),
            'cheque': ('#a855f7', 'Cheque'),
            'otro': ('#6b7280', 'Otro'),
        }
        color, label = config.get(obj.metodo_pago, ('#6b7280', obj.metodo_pago))
        return format_html(
            '<span style="background:{};color:#fff;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600">{}</span>',
            color, label,
        )

    @admin.display(description='Origen', ordering='origen')
    def origen_badge(self, obj):
        config = {
            'web': ('#0ea5e9', 'Web'),
            'admin': ('#7c3aed', 'Admin'),
        }
        color, label = config.get(obj.origen, ('#6b7280', obj.origen))
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600">{}</span>',
            color, label,
        )

    @admin.display(description='Comprobante')
    def tiene_comprobante(self, obj):
        # Culqi no necesita comprobante (tiene culqi_charge_id como evidencia).
        if obj.metodo_pago == 'culqi':
            return mark_safe('<span style="color:#9ca3af">N/A</span>')
        if obj.comprobante:
            return format_html(
                '<a href="{}" target="_blank" style="color:#22c55e;font-weight:600">Ver</a>',
                obj.comprobante.url,
            )
        return mark_safe('<span style="color:#ef4444;font-weight:600">Falta</span>')

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

    # Métodos manuales que requieren aprobación humana (no Culqi).
    METODOS_MANUALES = ('transferencia', 'efectivo', 'cheque', 'otro')

    @admin.action(description='Aprobar separación manual (marca depto como SEPARADO)')
    def aprobar_transferencia(self, request, queryset):
        elegibles = queryset.filter(
            estado='pendiente', metodo_pago__in=self.METODOS_MANUALES,
        )
        descartadas = queryset.count() - elegibles.count()
        updated = 0
        for sep in elegibles:
            sep.estado = 'completado'
            # El signal post_save sincroniza el estado del Departamento.
            sep.save(update_fields=['estado'])
            updated += 1
        msg = (
            f'{updated} separación(es) aprobada(s) y departamento(s) marcado(s) '
            'como SEPARADO.'
        )
        if descartadas:
            msg += (
                f' ({descartadas} ignorada(s) por no ser separaciones manuales '
                'pendientes.)'
            )
        self.message_user(request, msg)

    @admin.action(description='Rechazar separación manual (libera el departamento)')
    def rechazar_transferencia(self, request, queryset):
        from django.contrib import messages
        if 'apply' not in request.POST:
            # Mostrar confirmación
            from django.template.response import TemplateResponse
            elegibles = queryset.filter(
                estado='pendiente', metodo_pago__in=self.METODOS_MANUALES,
            )
            return TemplateResponse(request, 'admin/payments/confirmar_rechazo.html', {
                'separaciones': elegibles,
                'queryset': queryset,
                'action': 'rechazar_transferencia',
                'opts': self.model._meta,
            })
        elegibles = queryset.filter(
            estado='pendiente', metodo_pago__in=self.METODOS_MANUALES,
        )
        # Iteramos para que dispare el signal y recalcule el estado del depto.
        updated = 0
        for sep in elegibles:
            sep.estado = 'fallido'
            sep.save(update_fields=['estado'])
            updated += 1
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
