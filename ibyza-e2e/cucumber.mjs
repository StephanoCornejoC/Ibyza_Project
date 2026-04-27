/**
 * Configuracion Cucumber + Serenity/JS
 */
export default {
  default: {
    paths: ['features/**/*.feature'],
    import: [
      'src/step-definitions/hooks.js',
      'src/step-definitions/navegacion.steps.js',
      'src/step-definitions/inicio.steps.js',
      'src/step-definitions/proyectos.steps.js',
      'src/step-definitions/contacto.steps.js',
      'src/step-definitions/separacion.steps.js',
      'src/step-definitions/admin.steps.js',
    ],
    format: ['progress-bar', 'summary'],
    parallel: 1,
    publishQuiet: true,
    strict: false,
  },
}
