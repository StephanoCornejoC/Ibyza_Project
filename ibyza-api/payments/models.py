from django.db import models


class Separacion(models.Model):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente de aprobación'),
        ('completado', 'Aprobada / Completada'),
        ('fallido', 'Rechazada / Fallida'),
    ]
    METODO_PAGO_CHOICES = [
        ('culqi', 'Tarjeta (Culqi)'),
        ('transferencia', 'Transferencia bancaria'),
        ('efectivo', 'Efectivo'),
        ('cheque', 'Cheque'),
        ('otro', 'Otro'),
    ]
    ORIGEN_CHOICES = [
        ('web', 'Formulario público'),
        ('admin', 'Registro manual (admin)'),
    ]

    departamento = models.ForeignKey(
        'projects.Departamento', on_delete=models.PROTECT,
        related_name='separaciones', verbose_name='Departamento separado',
    )
    nombre = models.CharField('Nombre del comprador', max_length=100)
    apellido = models.CharField('Apellido del comprador', max_length=100)
    email = models.EmailField('Correo del comprador')
    telefono = models.CharField('Teléfono del comprador', max_length=20)
    dni = models.CharField(
        'DNI', max_length=20,
        help_text='Documento Nacional de Identidad del comprador (8 dígitos).',
    )
    monto = models.DecimalField(
        'Monto separado (S/)', max_digits=12, decimal_places=2,
        help_text='Monto que el cliente pagó como separación.',
    )
    metodo_pago = models.CharField(
        'Método de pago usado', max_length=20,
        choices=METODO_PAGO_CHOICES, default='culqi',
        help_text='Tarjeta (Culqi) se aprueba automáticamente. Transferencia, efectivo y cheque requieren aprobación manual.',
    )
    origen = models.CharField(
        'Origen del registro', max_length=10,
        choices=ORIGEN_CHOICES, default='web',
        help_text='Indica si la separación entró por la web pública o se registró manualmente desde el admin.',
        db_index=True,
    )
    culqi_charge_id = models.CharField(
        'ID de transacción Culqi', max_length=200, blank=True,
        help_text='Solo lectura. Se llena automáticamente cuando el pago es con tarjeta.',
    )
    numero_operacion = models.CharField(
        'N° de operación / referencia', max_length=100, blank=True,
        help_text='Número de operación bancaria, voucher de efectivo o referencia del cheque.',
    )
    comprobante = models.ImageField(
        'Comprobante de pago',
        upload_to='comprobantes/', blank=True, null=True,
        help_text='Imagen del voucher, comprobante de transferencia o cheque.',
    )
    notas_admin = models.TextField(
        'Notas internas (solo admin)', blank=True,
        help_text='Notas privadas para el equipo. No se muestran al comprador.',
    )
    estado = models.CharField(
        'Estado de la separación', max_length=20,
        choices=ESTADO_CHOICES, default='pendiente',
        help_text='Si pagó con tarjeta, se marca automáticamente como "Completada". Si fue por transferencia, debes aprobarla tú.',
    )
    error = models.TextField(
        'Detalle de error técnico (solo lectura)', blank=True,
        help_text='Si Culqi rechaza el pago, aquí queda registrado el motivo.',
    )
    registrado_en = models.DateTimeField('Registrada el', auto_now_add=True)

    class Meta:
        verbose_name = 'Separación'
        verbose_name_plural = 'Separaciones'
        ordering = ['-registrado_en']

    def __str__(self):
        return f'{self.nombre} {self.apellido} — {self.departamento} — {self.get_estado_display()}'
