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
        help_text='Tarjeta (Culqi) se aprueba automáticamente. Transferencia requiere tu aprobación manual.',
    )
    culqi_charge_id = models.CharField(
        'ID de transacción Culqi', max_length=200, blank=True,
        help_text='Solo lectura. Se llena automáticamente cuando el pago es con tarjeta.',
    )
    comprobante = models.ImageField(
        'Comprobante de transferencia',
        upload_to='comprobantes/', blank=True, null=True,
        help_text='El comprador sube esta imagen desde la web. Solo aplica si pagó por transferencia.',
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
