import { By, PageElement, PageElements } from '@serenity-js/web'

/**
 * Objetos de página para la Navbar de IBYZA.
 */
export const Navbar = {
  logo: () =>
    PageElement.located(By.css('header a[aria-label*="IBYZA"]')).describedAs('logo IBYZA'),

  links: () =>
    PageElements.located(By.css('header nav a')).describedAs('links del navbar'),

  linkPorTexto: (texto) =>
    PageElement.located(By.xpath(`(//header//nav//a[normalize-space(.)="${texto}"])[1]`))
      .describedAs(`link "${texto}"`),

  ctaVerProyectos: () =>
    PageElement.located(By.xpath('(//header//a[contains(., "Ver proyectos")])[1]'))
      .describedAs('boton CTA "Ver proyectos"'),
}
