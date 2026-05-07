/**
 * generateIcs / downloadIcs — Genera y descarga un archivo .ics
 * para que el usuario lo importe a su calendario despues de agendar la cita.
 *
 * Sin dependencias externas: el formato iCalendar (RFC 5545) es texto plano.
 */

/**
 * Construye el contenido VCALENDAR/VEVENT a partir de los datos de la cita.
 *
 * @param {object} args
 * @param {string} args.summary       Titulo del evento
 * @param {string} args.description   Detalle (acepta saltos de linea)
 * @param {string} args.location      Direccion / lugar
 * @param {Date}   args.dtStart       Inicio (UTC se serializa con la Z)
 * @param {Date}   args.dtEnd         Fin
 * @returns {string} contenido iCalendar listo para servir como text/calendar
 */
export function generateIcs({ summary, description, location, dtStart, dtEnd }) {
  const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const uid = `${crypto.randomUUID?.() || Date.now()}@ibyzacorp.com`;

  // Escapado minimo segun RFC 5545: comas, puntoycoma y backslash.
  const esc = (s) =>
    String(s ?? '')
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//IBYZA//Citas//ES',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(dtStart)}`,
    `DTEND:${fmt(dtEnd)}`,
    `SUMMARY:${esc(summary)}`,
    `DESCRIPTION:${esc(description)}`,
    `LOCATION:${esc(location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Dispara la descarga del .ics como un archivo cliente.
 * @param {string} content   Contenido iCalendar (de generateIcs).
 * @param {string} filename  Nombre del archivo (default: cita-ibyza.ics).
 */
export function downloadIcs(content, filename = 'cita-ibyza.ics') {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
