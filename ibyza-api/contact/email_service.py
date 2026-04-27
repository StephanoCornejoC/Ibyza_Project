"""
Servicio de envio de emails via Resend (https://resend.com).

Comportamiento:
- Si RESEND_API_KEY esta configurada: envia email real via Resend API
- Si no esta configurada y DEBUG=True: imprime en consola (dev)
- Si no esta configurada y DEBUG=False: loguea error (no rompe la peticion)
"""
import logging

from django.conf import settings

logger = logging.getLogger(__name__)


def _render_email_html(titulo, subtitulo, filas):
    """Genera HTML elegante con branding IBYZA (azul + dorado)."""
    rows_html = ''.join(
        f'''
        <tr>
          <td style="padding:10px 16px;background:#f8f9fc;border-bottom:1px solid #e5e7eb;
                     font-family:Arial,sans-serif;font-size:12px;font-weight:700;
                     color:#6b7280;text-transform:uppercase;letter-spacing:1px;width:35%">
            {etiqueta}
          </td>
          <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;
                     font-family:Arial,sans-serif;font-size:14px;color:#111827">
            {valor}
          </td>
        </tr>
        '''
        for etiqueta, valor in filas
    )

    return f'''<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,sans-serif">
  <table style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:14px;
                overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
    <tr>
      <td style="background:linear-gradient(135deg,#0F233B 0%,#1a3a5c 100%);padding:32px 24px;text-align:center">
        <h1 style="margin:0;color:#D6B370;font-size:32px;letter-spacing:6px;font-weight:900">IBYZA</h1>
        <p style="margin:4px 0 0;color:rgba(255,255,255,0.7);font-size:11px;
                  text-transform:uppercase;letter-spacing:3px">Ingenieria y Construccion</p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 24px 16px">
        <h2 style="margin:0 0 6px;color:#111827;font-size:20px">{titulo}</h2>
        <p style="margin:0;color:#6b7280;font-size:14px">{subtitulo}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 24px 24px">
        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
          {rows_html}
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 24px;background:#0F233B;text-align:center">
        <p style="margin:0;color:rgba(255,255,255,0.6);font-size:11px">
          Este correo fue generado automaticamente desde ibyzacorp.com
        </p>
      </td>
    </tr>
  </table>
</body>
</html>'''


def send_notification(subject, html_body, text_body=None):
    """
    Envia un email transaccional a settings.EMAIL_RECIPIENTS.

    Returns:
        dict con {'ok': bool, 'provider': 'resend'|'console'|'none', 'id': str|None, 'error': str|None}
    """
    recipients = settings.EMAIL_RECIPIENTS
    if not recipients:
        logger.warning('EMAIL_RECIPIENTS vacio — skipping')
        return {'ok': False, 'provider': 'none', 'id': None, 'error': 'sin destinatarios'}

    api_key = getattr(settings, 'RESEND_API_KEY', '')
    from_email = getattr(settings, 'RESEND_FROM_EMAIL', 'IBYZA <onboarding@resend.dev>')

    # Modo 1: Resend configurado — envio real
    if api_key:
        try:
            import resend
            resend.api_key = api_key
            params = {
                'from': from_email,
                'to': recipients,
                'subject': subject,
                'html': html_body,
            }
            if text_body:
                params['text'] = text_body
            result = resend.Emails.send(params)
            email_id = result.get('id') if isinstance(result, dict) else None
            logger.info('Resend OK - id=%s to=%s', email_id, ', '.join(recipients))
            return {'ok': True, 'provider': 'resend', 'id': email_id, 'error': None}
        except Exception as e:
            logger.exception('Error enviando email via Resend')
            return {'ok': False, 'provider': 'resend', 'id': None, 'error': str(e)}

    # Modo 2: DEBUG sin Resend — imprime en consola
    if settings.DEBUG:
        print('─' * 60)
        print(f'[DEV EMAIL] De: {from_email}')
        print(f'[DEV EMAIL] Para: {", ".join(recipients)}')
        print(f'[DEV EMAIL] Asunto: {subject}')
        print('─' * 60)
        if text_body:
            print(text_body)
        print('─' * 60)
        return {'ok': True, 'provider': 'console', 'id': None, 'error': None}

    # Modo 3: produccion sin Resend — warning
    logger.error('RESEND_API_KEY no configurada en produccion')
    return {'ok': False, 'provider': 'none', 'id': None, 'error': 'RESEND_API_KEY no configurada'}
