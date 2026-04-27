import { Task } from '@serenity-js/core'
import { Navigate } from '@serenity-js/web'

/**
 * Task: Navegar a una ruta del sitio.
 * Uso: actor.attemptsTo(NavegarA.laPagina('/proyectos'))
 */
export const NavegarA = {
  laPagina: (ruta) =>
    Task.where(`#actor navega a ${ruta}`, Navigate.to(ruta)),

  elInicio: () =>
    Task.where(`#actor navega al inicio`, Navigate.to('/')),
}
