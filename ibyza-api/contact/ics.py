"""Generación mínima de archivos .ics (RFC 5545) sin dependencias externas."""
from datetime import datetime, timedelta
from uuid import uuid4


def generar_ics_cita(cita) -> str:
    """Devuelve un string .ics para una SolicitudCita."""
    from content.models import ConfiguracionSitio

    config = ConfiguracionSitio.get_solo()
    inicio = cita.fecha_preferida
    fin = inicio + timedelta(hours=1)
    fmt = '%Y%m%dT%H%M%S'

    if cita.tipo == 'virtual' and config.meet_link_permanente:
        location = config.meet_link_permanente
    else:
        location = config.direccion or 'Arequipa, Perú'

    summary = f'Cita IBYZA - {cita.get_tipo_display()}'
    description = (
        f'Cita con IBYZA Ingenieria y Construccion.\\n\\n'
        f'Tipo: {cita.get_tipo_display()}\\n'
        f'Solicitante: {cita.nombre} {cita.apellido}\\n'
    )
    if cita.tipo == 'virtual' and config.meet_link_permanente:
        description += f'Reunión por Meet: {config.meet_link_permanente}\\n'
    if cita.mensaje:
        description += f'\\nNota del cliente: {cita.mensaje}\\n'

    uid = f'{uuid4()}@ibyzacorp.com'

    return (
        'BEGIN:VCALENDAR\r\n'
        'VERSION:2.0\r\n'
        'PRODID:-//IBYZA//Citas//ES\r\n'
        'CALSCALE:GREGORIAN\r\n'
        'METHOD:PUBLISH\r\n'
        'BEGIN:VEVENT\r\n'
        f'UID:{uid}\r\n'
        f'DTSTAMP:{datetime.utcnow().strftime(fmt)}Z\r\n'
        f'DTSTART:{inicio.strftime(fmt)}\r\n'
        f'DTEND:{fin.strftime(fmt)}\r\n'
        f'SUMMARY:{summary}\r\n'
        f'DESCRIPTION:{description}\r\n'
        f'LOCATION:{location}\r\n'
        'END:VEVENT\r\n'
        'END:VCALENDAR\r\n'
    )
