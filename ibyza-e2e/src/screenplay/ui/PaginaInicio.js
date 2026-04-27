import { By, PageElement, PageElements } from '@serenity-js/web'

export const PaginaInicio = {
  logoHero: () =>
    PageElement.located(By.xpath('(//main//*[normalize-space(.)="IBYZA"])[1]'))
      .describedAs('logo grande IBYZA'),

  tagline: () =>
    PageElement.located(By.xpath('(//main//p[contains(translate(., "abcdefghijklmnopqrstuvwxyz", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"), "CONSTRUCCION")])[1]'))
      .describedAs('tagline Ingenieria y Construccion'),

  botonPorTexto: (texto) =>
    PageElement.located(By.xpath(`(//main//a[contains(normalize-space(.), "${texto}")] | //main//button[contains(normalize-space(.), "${texto}")])[1]`))
      .describedAs(`boton "${texto}"`),

  seccionQuienesSomos: () =>
    PageElement.located(By.xpath('(//main//span[normalize-space(.)="Quienes"] | //main//h2[contains(., "Quienes") or contains(., "Somos")])[1]'))
      .describedAs('seccion Quienes Somos'),

  tarjetaValor: (texto) =>
    PageElement.located(By.xpath(`(//main//*[self::h3 or self::h4][contains(translate(normalize-space(.), "abcdefghijklmnopqrstuvwxyz", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"), "${texto.toUpperCase()}")])[1]`))
      .describedAs(`tarjeta valor "${texto}"`),

  carruselProyectos: () =>
    PageElements.located(By.css('main a[href*="/proyectos/"]')).describedAs('proyectos en carrusel'),

  precios: () =>
    PageElements.located(By.xpath('//main//*[contains(text(), "$")]'))
      .describedAs('precios en dolares'),
}

export const PaginaNoEncontrada = {
  mensaje: () =>
    PageElement.located(By.xpath('(//main//*[self::h1 or self::h2][contains(normalize-space(.), "404")])[1]'))
      .describedAs('mensaje 404'),
}
