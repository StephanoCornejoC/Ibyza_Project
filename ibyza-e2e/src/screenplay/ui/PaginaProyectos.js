import { By, PageElement, PageElements } from '@serenity-js/web'

export const PaginaProyectos = {
  titulo: () =>
    PageElement.located(By.css('h1, h2')).describedAs('titulo Nuestros proyectos'),

  tarjetas: () =>
    PageElements.located(By.xpath('//main//a[starts-with(@href, "/proyectos/") and string-length(@href) > 12]'))
      .describedAs('tarjetas de proyecto'),

  tarjetaPorNombre: (nombre) =>
    PageElement.located(By.xpath(`//a[contains(@href, "/proyectos/") and .//h2[contains(normalize-space(.), "${nombre}")] or .//h3[contains(normalize-space(.), "${nombre}")]]`))
      .describedAs(`tarjeta del proyecto "${nombre}"`),

  filtros: () =>
    PageElements.located(By.css('button')).describedAs('botones de filtro'),

  filtroPorTexto: (texto) =>
    PageElement.located(By.xpath(`//button[contains(normalize-space(.), "${texto}")]`))
      .describedAs(`filtro "${texto}"`),
}

export const PaginaDetalleProyecto = {
  heroTitulo: () =>
    PageElement.located(By.css('main h1')).describedAs('titulo del proyecto'),

  botonVolver: () =>
    PageElement.located(By.xpath('(//a[contains(translate(., "abcdefghijklmnopqrstuvwxyz", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"), "VOLVER")])[1]'))
      .describedAs('boton "Volver a Proyectos"'),

  botonesSeparar: () =>
    PageElements.located(By.xpath('//button[contains(translate(., "abcdefghijklmnopqrstuvwxyz", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"), "SEPARAR")]'))
      .describedAs('botones "Separar"'),
}
