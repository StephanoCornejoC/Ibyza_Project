/**
 * Constantes de rutas de la aplicación IBYZA.
 * Centralizar aquí evita strings duplicados y facilita cambios futuros.
 */
export const ROUTES = {
  HOME: '/',
  ABOUT: '/nosotros',
  PROJECTS: '/proyectos',
  PROJECT_DETAIL: '/proyectos/:slug',
  SEPARACION: '/separacion',
  CONTACT: '/contacto',
};

/**
 * Helper para construir la ruta de detalle de un proyecto específico.
 * Uso: buildProjectDetailRoute('proyecto-miraflores')
 */
export const buildProjectDetailRoute = (slug) => `/proyectos/${slug}`;
