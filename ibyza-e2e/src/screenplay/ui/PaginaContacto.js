import { By, PageElement, PageElements } from '@serenity-js/web'

export const PaginaContacto = {
  titulo: () =>
    PageElement.located(By.xpath('//h1[contains(normalize-space(.), "Contactanos") or contains(normalize-space(.), "Contáctanos")]'))
      .describedAs('titulo Contactanos'),

  tabs: () =>
    PageElements.located(By.xpath('//button[contains(., "Enviar mensaje") or contains(., "Agendar visita")]'))
      .describedAs('tabs de contacto'),

  tabPorTexto: (texto) =>
    PageElement.located(By.xpath(`(//main//button[contains(normalize-space(.), "${texto}")])[1]`))
      .describedAs(`tab "${texto}"`),

  input: (nombre) =>
    PageElement.located(By.css(`input[name="${nombre}"]`)).describedAs(`input ${nombre}`),

  textarea: (nombre) =>
    PageElement.located(By.css(`textarea[name="${nombre}"]`)).describedAs(`textarea ${nombre}`),

  botonEnviar: () =>
    PageElement.located(By.xpath('//button[@type="submit"]')).describedAs('boton enviar'),

  mensajeExito: () =>
    PageElement.located(By.xpath('//*[contains(normalize-space(.), "enviado") or contains(normalize-space(.), "recibido") or contains(normalize-space(.), "gracias")]'))
      .describedAs('mensaje de exito'),

  errores: () =>
    PageElements.located(By.css('[role="alert"], .error, [class*="error" i]'))
      .describedAs('mensajes de error'),

  infoContacto: () =>
    PageElement.located(By.xpath('(//main//h3[contains(translate(., "abcdefghijklmnopqrstuvwxyz", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"), "CONTACTO")])[1]'))
      .describedAs('panel info contacto'),

  proyectosInteres: () =>
    PageElement.located(By.xpath(
      '(//main//*[self::p or self::h3 or self::h4 or self::div]' +
      '[contains(translate(., "ÁÉÍÓÚabcdefghijklmnopqrstuvwxyz", "AEIOUABCDEFGHIJKLMNOPQRSTUVWXYZ"), "PROYECTOS") ' +
      'and (contains(translate(., "ÁÉÍÓÚabcdefghijklmnopqrstuvwxyz", "AEIOUABCDEFGHIJKLMNOPQRSTUVWXYZ"), "INTERES") ' +
      'or contains(translate(., "ÁÉÍÓÚabcdefghijklmnopqrstuvwxyz", "AEIOUABCDEFGHIJKLMNOPQRSTUVWXYZ"), "ACTIVOS"))])[1]'
    )).describedAs('seccion proyectos de interes'),
}
