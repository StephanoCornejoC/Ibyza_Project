from django.db import models


class SolicitudContacto(models.Model):
    nombre = models.CharField('Nombre', max_length=100)
    apellido = models.CharField('Apellido', max_length=100)
    email = models.EmailField('Correo electrónico')
    telefono = models.CharField('Teléfono', max_length=20)
    proyecto_interes = models.CharField(
        'Proyecto de interés', max_length=200, blank=True,
        help_text='Proyecto que el cliente seleccionó al enviar el formulario.',
    )
    mensaje = models.TextField('Mensaje del cliente')
    leido = models.BooleanField(
        'Leído', default=False,
        help_text='Marca esto cuando ya hayas atendido al cliente.',
    )
    recibido_en = models.DateTimeField('Recibido en', auto_now_add=True)

    class Meta:
        verbose_name = 'Mensaje de contacto'
        verbose_name_plural = 'Mensajes de contacto'
        ordering = ['-recibido_en']

    def __str__(self):
        return f'{self.nombre} {self.apellido} — {self.recibido_en.strftime("%d/%m/%Y")}'


class SolicitudCita(models.Model):
    TIPO_CHOICES = [
        ('presencial', 'Presencial en oficina'),
        ('virtual', 'Reunión por Google Meet'),
    ]
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente de confirmación'),
        ('confirmada', 'Confirmada'),
        ('cancelada', 'Cancelada'),
    ]

    nombre = models.CharField('Nombre', max_length=100)
    apellido = models.CharField('Apellido', max_length=100)
    email = models.EmailField('Correo electrónico')
    telefono = models.CharField('Teléfono', max_length=20)
    tipo = models.CharField(
        'Tipo de cita', max_length=20, choices=TIPO_CHOICES, default='presencial',
        help_text='Presencial en oficina o virtual por Google Meet.',
    )
    fecha_preferida = models.DateTimeField(
        'Fecha y hora solicitada',
        help_text='Fecha y hora que el cliente eligió en el formulario.',
    )
    mensaje = models.TextField('Mensaje adicional', blank=True)
    estado = models.CharField(
        'Estado de la cita', max_length=20, choices=ESTADO_CHOICES, default='pendiente',
        help_text='Cambia a "Confirmada" cuando agendes la reunión con el cliente.',
    )
    recibido_en = models.DateTimeField('Recibido en', auto_now_add=True)

    class Meta:
        verbose_name = 'Solicitud de cita'
        verbose_name_plural = 'Solicitudes de cita'
        ordering = ['-recibido_en']

    def __str__(self):
        return f'{self.nombre} {self.apellido} — {self.fecha_preferida.strftime("%d/%m/%Y %H:%M")}'
