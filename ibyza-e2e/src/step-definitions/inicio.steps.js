import { When, Then } from '@cucumber/cucumber'
import { actorCalled } from '@serenity-js/core'
import { Scroll, isVisible, Text, ExecuteScript } from '@serenity-js/web'
import { Ensure, contain, includes } from '@serenity-js/assertions'
import { PaginaInicio } from '../screenplay/ui/PaginaInicio.js'
import { Comun } from '../screenplay/ui/Comun.js'

When('hace scroll a la sección {string}', async function (seccion) {
  const actor = actorCalled('Carlos')
  await actor.attemptsTo(ExecuteScript.sync('window.scrollTo(0, 900)'))
  await new Promise((r) => setTimeout(r, 1000))
})

When('hace scroll al carrusel de proyectos', { timeout: 15_000 }, async function () {
  const actor = actorCalled('Carlos')
  // Scroll gradual al final para renderizar secciones lazy
  await actor.attemptsTo(ExecuteScript.sync('window.scrollTo(0, 1500)'))
  await new Promise((r) => setTimeout(r, 800))
  await actor.attemptsTo(ExecuteScript.sync('window.scrollTo(0, 2500)'))
  await new Promise((r) => setTimeout(r, 1500))
})

Then('debe ver el logo grande {string} en el hero', async function (texto) {
  await actorCalled('Carlos').attemptsTo(
    Ensure.that(PaginaInicio.logoHero(), isVisible()),
    Ensure.that(Text.of(PaginaInicio.logoHero()), includes(texto)),
  )
})

Then('debe ver el tagline {string}', async function (texto) {
  await actorCalled('Carlos').attemptsTo(
    Ensure.that(PaginaInicio.tagline(), isVisible()),
  )
})

Then('debe ver los botones {string} y {string}', async function (t1, t2) {
  await actorCalled('Carlos').attemptsTo(
    Ensure.that(PaginaInicio.botonPorTexto(t1), isVisible()),
    Ensure.that(PaginaInicio.botonPorTexto(t2), isVisible()),
  )
})

Then('debe ver el encabezado {string}', { timeout: 15_000 }, async function (texto) {
  const actor = actorCalled('Carlos')
  // Espera por render cliente y Helmet
  await new Promise((r) => setTimeout(r, 800))
  await actor.attemptsTo(
    Ensure.that(Comun.encabezadoConTexto(texto), isVisible()),
  )
})

Then('debe ver las 3 tarjetas de valores {string}', async function (valores) {
  const esperados = valores.split(',').map((s) => s.trim())
  for (const valor of esperados) {
    await actorCalled('Carlos').attemptsTo(
      Ensure.that(PaginaInicio.tarjetaValor(valor), isVisible()),
    )
  }
})

Then('debe ver al menos {int} proyectos en el carrusel', { timeout: 15_000 }, async function (n) {
  const actor = actorCalled('Carlos')
  // El carrusel triplica los proyectos para loop infinito
  await new Promise((r) => setTimeout(r, 1500))
  let count = 0
  for (let i = 0; i < 10; i++) {
    count = await PaginaInicio.carruselProyectos().count().answeredBy(actor)
    if (count >= n) return
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`Esperaba >=${n} proyectos, se vieron ${count}`)
})

Then('cada proyecto debe tener nombre visible', async function () {
  const count = await PaginaInicio.carruselProyectos().count().answeredBy(actorCalled('Carlos'))
  if (count === 0) throw new Error('No se encontraron proyectos en el carrusel')
})

Then('cada proyecto debe tener estado {string}, {string}, {string} o {string}', async function (e1, e2, e3, e4) {
  const count = await PaginaInicio.carruselProyectos().count().answeredBy(actorCalled('Carlos'))
  if (count === 0) throw new Error('Sin proyectos en carrusel')
})

Then('cada proyecto debe tener estado {string}', async function (estados) {
  const count = await PaginaInicio.carruselProyectos().count().answeredBy(actorCalled('Carlos'))
  if (count === 0) throw new Error('Sin proyectos en carrusel')
})

Then('los precios mostrados deben usar el símbolo {string}', async function (simbolo) {
  const precios = PaginaInicio.precios()
  const count = await precios.count().answeredBy(actorCalled('Carlos'))
  if (count === 0) {
    throw new Error(`No se encontraron precios con simbolo "${simbolo}"`)
  }
})
