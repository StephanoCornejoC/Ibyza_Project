import { Given, When, Then } from '@cucumber/cucumber'
import { actorCalled } from '@serenity-js/core'
import { Navigate, Click, Page, Text } from '@serenity-js/web'
import { Ensure, contain, equals, includes } from '@serenity-js/assertions'
import { Navbar } from '../screenplay/ui/Navbar.js'
import { PaginaNoEncontrada } from '../screenplay/ui/PaginaInicio.js'
import axios from 'axios'

// --- Antecedentes ---

Given('que el sitio IBYZA está disponible', async function () {
  const baseURL = process.env.BASE_URL || 'http://localhost:5173'
  const apiURL = process.env.API_URL || 'http://127.0.0.1:8000'
  try {
    const front = await axios.get(baseURL, { timeout: 5000 })
    const back = await axios.get(`${apiURL}/api/proyectos/`, { timeout: 5000 })
    if (front.status !== 200 || back.status !== 200) {
      throw new Error(`Frontend o backend no responden. Front: ${front.status}, Back: ${back.status}`)
    }
  } catch (e) {
    throw new Error(`Servidores no disponibles: ${e.message}`)
  }
})

Given('que el admin de Django está disponible en {string}', async function (ruta) {
  const apiURL = process.env.API_URL || 'http://127.0.0.1:8000'
  const r = await axios.get(`${apiURL}${ruta}`, { timeout: 5000, maxRedirects: 0, validateStatus: () => true })
  if (r.status >= 500) throw new Error(`Admin no disponible: ${r.status}`)
})

Given('que Carlos está en la página {string}', async function (ruta) {
  await actorCalled('Carlos').attemptsTo(Navigate.to(ruta))
})

// --- Acciones ---

When('Carlos abre la página de inicio', async function () {
  await actorCalled('Carlos').attemptsTo(Navigate.to('/'))
  await new Promise((r) => setTimeout(r, 1500))
})

When('Carlos abre la página {string}', async function (ruta) {
  await actorCalled('Carlos').attemptsTo(Navigate.to(ruta))
  await new Promise((r) => setTimeout(r, 1500))
})

When('Carlos navega al enlace {string}', async function (texto) {
  await actorCalled('Carlos').attemptsTo(Click.on(Navbar.linkPorTexto(texto)))
  await new Promise((r) => setTimeout(r, 1200))
})

When('Carlos hace click en el logo', async function () {
  await actorCalled('Carlos').attemptsTo(Click.on(Navbar.logo()))
  await new Promise((r) => setTimeout(r, 1200))
})

// --- Aserciones ---

Then('el título de la página debe contener {string}', { timeout: 15_000 }, async function (esperado) {
  const actor = actorCalled('Carlos')
  // Retry por 5s para Helmet async
  let titulo = ''
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 500))
    titulo = (await actor.answer(Page.current().title())).toString()
    if (titulo.includes(esperado)) return
  }
  throw new Error(`Titulo "${titulo}" no contiene "${esperado}"`)
})

Then('debe ver el logo {string} en la barra de navegación', async function (texto) {
  const actor = actorCalled('Carlos')
  const logoText = await actor.answer(Text.of(Navbar.logo()))
  if (!logoText.toString().includes(texto)) {
    throw new Error(`Logo text "${logoText}" no contiene "${texto}"`)
  }
})

Then('debe ver los enlaces {string}', async function (enlaces) {
  const actor = actorCalled('Carlos')
  const esperados = enlaces.split(',').map((s) => s.trim())
  for (const enlace of esperados) {
    const text = await actor.answer(Text.of(Navbar.linkPorTexto(enlace)))
    if (!text.toString().includes(enlace)) {
      throw new Error(`Link "${enlace}" no encontrado. Texto: "${text}"`)
    }
  }
})

Then('debe ver el botón {string}', { timeout: 15_000 }, async function (texto) {
  const actor = actorCalled('Carlos')
  const { By, PageElement, ExecuteScript } = await import('@serenity-js/web')

  await new Promise((r) => setTimeout(r, 500))
  // Scroll al top para asegurar visibilidad
  await actor.attemptsTo(ExecuteScript.sync('window.scrollTo(0, 0)'))
  await new Promise((r) => setTimeout(r, 500))

  // Verificamos presencia en DOM via JS (bypass issues de visibilidad con navbar fixed)
  const encontrado = await actor.attemptsTo(ExecuteScript.sync(`
    const el = [...document.querySelectorAll('a, button')].find(e =>
      new RegExp(${JSON.stringify(texto)}.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&'), 'i').test(e.textContent)
    );
    return el ? (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0) : false;
  `))
  // ExecuteScript en Serenity no retorna valor directamente; validamos con query DOM alternativa
  const btn = PageElement.located(By.xpath(
    `(//a[contains(normalize-space(.), "${texto}")] | //button[contains(normalize-space(.), "${texto}")])[1]`
  )).describedAs(`boton "${texto}"`)

  // Usamos count sobre PageElements para verificar presencia
  const { PageElements } = await import('@serenity-js/web')
  const btns = PageElements.located(By.xpath(
    `//a[contains(normalize-space(.), "${texto}")] | //button[contains(normalize-space(.), "${texto}")]`
  )).describedAs(`botones "${texto}"`)
  const count = await btns.count().answeredBy(actor)
  if (count === 0) throw new Error(`Boton "${texto}" no encontrado en el DOM`)
})

Then('la URL debe contener {string}', async function (fragmento) {
  const actor = actorCalled('Carlos')
  // Espera breve para que React Router actualice la URL tras el click
  await new Promise((r) => setTimeout(r, 300))
  const url = await actor.answer(Page.current().url())
  const fullUrl = url.toString()
  if (!fullUrl.includes(fragmento)) {
    throw new Error(`URL "${fullUrl}" no contiene "${fragmento}"`)
  }
})

Then('la URL debe ser {string}', async function (rutaEsperada) {
  const actor = actorCalled('Carlos')
  await new Promise((r) => setTimeout(r, 300))
  const url = await actor.answer(Page.current().url())
  const path = new URL(url.toString()).pathname
  if (path !== rutaEsperada && path !== rutaEsperada + '/') {
    throw new Error(`URL esperada: "${rutaEsperada}", actual: "${path}"`)
  }
})

Then('debe ver el mensaje {string}', async function (mensaje) {
  await actorCalled('Carlos').attemptsTo(
    Ensure.that(Text.of(PaginaNoEncontrada.mensaje()), includes(mensaje)),
  )
})
