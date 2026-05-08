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
  AVANCE: '/avance',
  AVANCE_CODIGO: '/avance/:codigo',
  CONTACT: '/contacto',
};

/**
 * Helper para construir la ruta de detalle de un proyecto específico.
 * Uso: buildProjectDetailRoute('proyecto-miraflores')
 */
export const buildProjectDetailRoute = (slug) => `/proyectos/${slug}`;

/**
 * Helper para construir la ruta de avance con código.
 * Uso: buildAvanceRoute('ABC-123-XYZ9')
 */
export const buildAvanceRoute = (codigo) => `/avance/${encodeURIComponent(codigo)}`;
