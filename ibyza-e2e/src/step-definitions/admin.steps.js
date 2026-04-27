import { Given, When, Then } from '@cucumber/cucumber'
import { actorCalled } from '@serenity-js/core'
import { Navigate, PageElement, By, isVisible } from '@serenity-js/web'
import { Ensure, includes } from '@serenity-js/assertions'
import axios from 'axios'

const API = process.env.API_URL || 'http://127.0.0.1:8000'

When('Carlos abre la página de login del admin', async function () {
  // Navega directamente al admin login - Django sirve esa URL
  const actor = actorCalled('Carlos')
  // El admin está en http://127.0.0.1:8000/admin/, no en localhost:5173
  // Navegamos directo con el API host
  await actor.attemptsTo(Navigate.to(`${API}/admin/login/?next=/admin/`))
})

When('se intenta acceder a {string} sin login', async function (ruta) {
  this.apiResponse = await axios.get(`${API}${ruta}`, {
    maxRedirects: 0,
    validateStatus: () => true,
  })
})

Then('debe ver el formulario de login', async function () {
  const form = PageElement.located(By.css('form#login-form, form')).describedAs('form login')
  await actorCalled('Carlos').attemptsTo(Ensure.that(form, isVisible()))
})

Then('debe ver los campos {string} y {string}', async function (c1, c2) {
  const actor = actorCalled('Carlos')
  const campo1 = PageElement.located(By.css(`input[name="username"], input[placeholder*="${c1.toLowerCase()}" i]`))
    .describedAs(`campo ${c1}`)
  const campo2 = PageElement.located(By.css(`input[name="password"], input[placeholder*="${c2.toLowerCase()}" i]`))
    .describedAs(`campo ${c2}`)
  await actor.attemptsTo(
    Ensure.that(campo1, isVisible()),
    Ensure.that(campo2, isVisible()),
  )
})

Then('debe ser redirigido al login', async function () {
  if (this.apiResponse.status !== 302 && this.apiResponse.status !== 301) {
    throw new Error(`Esperaba redirect (302/301), recibí ${this.apiResponse.status}`)
  }
  const location = this.apiResponse.headers.location || ''
  if (!location.includes('login')) {
    throw new Error(`Redirect no va a login: ${location}`)
  }
})
