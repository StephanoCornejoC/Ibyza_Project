import { By, PageElement, PageElements } from '@serenity-js/web'

/**
 * Selectores genericos reutilizables.
 */
export const Comun = {
  encabezadoConTexto: (texto) =>
    PageElement.located(By.xpath(
      `(//main//h1[contains(normalize-space(.), "${texto}")] | ` +
      `//main//h2[contains(normalize-space(.), "${texto}")] | ` +
      `//main//h3[contains(normalize-space(.), "${texto}")] | ` +
      `//main//h2//span[contains(normalize-space(.), "${texto}")])[1]`
    )).describedAs(`encabezado "${texto}"`),

  textoEnPagina: (texto) =>
    PageElement.located(By.xpath(
      `(//main//*[contains(normalize-space(.), "${texto}") and not(self::script) and not(self::style)])[last()]`
    )).describedAs(`texto "${texto}"`),
}
