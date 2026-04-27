import logging

from rest_framework import generics
from rest_framework.throttling import AnonRateThrottle

from .email_service import _render_email_html, send_notification
from .models import SolicitudContacto, SolicitudCita
from .serializers import SolicitudContactoSerializer, SolicitudCitaSerializer

logger = logging.getLogger(__name__)


class ContactFormThrottle(AnonRateThrottle):
    """Limita formularios de contacto a 5 por minuto por IP."""
    rate = '5/min'


# Alias retrocompatible para tests que hacen patch('contact.views._send_notification')
_send_notification = send_notification


class SolicitudContactoView(generics.CreateAPIView):
    serializer_class = SolicitudContactoSerializer
    throttle_classes = [ContactFormThrottle]

    def perform_create(self, serializer):
        obj = serializer.save()
        try:
            subject = f'[IBYZA] Nueva consulta de {obj.nombre} {obj.apellido}'

            text_body = (
                f'Nueva consulta recibida desde el sitio web.\n\n'
                f'Nombre: {obj.nombre} {obj.apellido}\n'
                f'Email: {obj.email}\n'
                f'Telefono: {obj.telefono}\n'
                f'Proyecto: {obj.proyecto_interes or "No especificado"}\n'
                f'Recibido: {obj.recibido_en.strftime("%d/%m/%Y %H:%M")}\n\n'
                f'Mensaje:\n{obj.mensaje}'
            )

            filas = [
                ('Nombre', f'{obj.nombre} {obj.apellido}'),
                ('Email', f'<a href="mailto:{obj.email}" style="color:#D6B370;text-decoration:none">{obj.email}</a>'),
                ('Telefono', f'<a href="tel:{obj.telefono}" style="color:#D6B370;text-decoration:none">{obj.telefono}</a>'),
                ('Proyecto de interes', obj.proyecto_interes or '—'),
                ('Fecha', obj.recibido_en.strftime('%d/%m/%Y %H:%M')),
                ('Mensaje', obj.mensaje.replace('\n', '<br>')),
            ]
            html_body = _render_email_html(
                titulo='Nueva consulta de contacto',
                subtitulo='Un visitante envio el formulario de contacto',
                filas=filas,
            )
            _send_notification(subject, html_body, text_body)
        except Exception:
            logger.exception('Error enviando notificacion de contacto para %s', obj.pk)


class SolicitudCitaView(generics.CreateAPIView):
    serializer_class = SolicitudCitaSerializer
    throttle_classes = [ContactFormThrottle]

    def perform_create(self, serializer):
        obj = serializer.save()
        try:
            subject = f'[IBYZA] Nueva cita - {obj.get_tipo_display()}'

            text_body = (
                f'Nueva cita solicitada desde el sitio web.\n\n'
                f'Nombre: {obj.nombre} {obj.apellido}\n'
                f'Email: {obj.email}\n'
                f'Telefono: {obj.telefono}\n'
                f'Tipo: {obj.get_tipo_display()}\n'
                f'Fecha preferida: {obj.fecha_preferida.strftime("%d/%m/%Y %H:%M")}\n\n'
                f'Mensaje: {obj.mensaje or "Sin mensaje"}'
            )

            filas = [
                ('Nombre', f'{obj.nombre} {obj.apellido}'),
                ('Email', f'<a href="mailto:{obj.email}" style="color:#D6B370;text-decoration:none">{obj.email}</a>'),
                ('Telefono', f'<a href="tel:{obj.telefono}" style="color:#D6B370;text-decoration:none">{obj.telefono}</a>'),
                ('Tipo de cita', obj.get_tipo_display()),
                ('Fecha preferida', obj.fecha_preferida.strftime('%d/%m/%Y %H:%M')),
                ('Mensaje', (obj.mensaje or '—').replace('\n', '<br>')),
            ]
            html_body = _render_email_html(
                titulo='Nueva cita solicitada',
                subtitulo='Un visitante agendo una visita',
                filas=filas,
            )
            _send_notification(subject, html_body, text_body)
        except Exception:
            logger.exception('Error enviando notificacion de cita para %s', obj.pk)
