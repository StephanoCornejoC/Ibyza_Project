import { By, PageElement, PageElements } from '@serenity-js/web'

export const ModalSeparacion = {
  modal: () =>
    PageElement.located(By.css('[role="dialog"], [class*="Modal" i]')).describedAs('modal de separacion'),

  tituloPaso: () =>
    PageElement.located(By.xpath('//*[contains(normalize-space(.), "Datos del comprador") or contains(normalize-space(.), "Confirmar y pagar")]'))
      .describedAs('titulo del paso'),

  tabMetodoPago: (metodo) =>
    PageElement.located(By.xpath(`(//button[contains(normalize-space(.), "${metodo}")])[1]`))
      .describedAs(`tab metodo de pago "${metodo}"`),

  input: (nombre) =>
    PageElement.located(By.css(`input[name="${nombre}"]`)).describedAs(`input ${nombre}`),

  botonContinuar: () =>
    PageElement.located(By.xpath('//button[contains(normalize-space(.), "Continuar") or contains(normalize-space(.), "Siguiente")]'))
      .describedAs('boton Continuar'),

  botonCerrar: () =>
    PageElement.located(By.css('[aria-label*="Cerrar" i], [aria-label*="close" i], button[class*="close" i]'))
      .describedAs('boton cerrar modal'),

  datosBancarios: {
    empresa: () =>
      PageElement.located(By.xpath(
        '(//*[self::span or self::p or self::strong or self::div]' +
        '[normalize-space(.) = "IB Y ZA INGENIERIA Y CONSTRUCCION SAC" ' +
        'or contains(normalize-space(.), "IB Y ZA") ' +
        'or contains(normalize-space(.), "INMOBILIARIO IBYZA") ' +
        'or contains(normalize-space(.), "LUXURY")])[1]'
      )).describedAs('empresa receptora'),

    ruc: () =>
      PageElement.located(By.xpath('(//*[self::span or self::p or self::strong][normalize-space(.) = "RUC"])[1]'))
        .describedAs('etiqueta RUC'),

    cuenta: () =>
      PageElement.located(By.xpath('(//*[self::span or self::p or self::strong][contains(normalize-space(.), "Cuenta")])[1]'))
        .describedAs('etiqueta cuenta'),
  },

  botonEnviarComprobante: () =>
    PageElement.located(By.xpath('//button[contains(normalize-space(.), "Enviar comprobante")]'))
      .describedAs('boton Enviar comprobante'),

  erroresValidacion: () =>
    PageElements.located(By.css('[role="alert"], [class*="error" i]')).describedAs('errores validacion'),
}
