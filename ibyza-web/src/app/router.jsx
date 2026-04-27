import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import Layout from '@/shared/components/layout/Layout';
import ErrorBoundary from '@/shared/components/feedback/ErrorBoundary';

/**
 * Páginas con lazy loading — React carga el bundle de cada página
 * solo cuando el usuario navega a esa ruta. Mejora el tiempo de carga inicial.
 */
const HomePage = lazy(() => import('@/features/home/HomePage'));
const AboutPage = lazy(() => import('@/features/about/AboutPage'));
const ProjectsPage = lazy(() => import('@/features/projects/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('@/features/projects/ProjectDetailPage'));
const ContactPage = lazy(() => import('@/features/contact/ContactPage'));
const SeparacionPage = lazy(() => import('@/features/separation/SeparacionPage'));
const NotFoundPage = lazy(() => import('@/features/not-found/NotFoundPage'));

/**
 * Wrapper que aplica el Layout común a cada ruta.
 * Recibe los props de meta (title, description) de cada página.
 */
const withLayout = (Component, layoutProps = {}) => (
  <ErrorBoundary>
    <Layout {...layoutProps}>
      <Component />
    </Layout>
  </ErrorBoundary>
);

const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: withLayout(HomePage, {
      title: 'Inicio',
      description: 'IBYZA — Proyectos inmobiliarios de calidad en Arequipa.',
    }),
  },
  {
    path: ROUTES.ABOUT,
    element: withLayout(AboutPage, {
      title: 'Nosotros',
      description: 'Conoce la historia, misión y valores de IBYZA.',
    }),
  },
  {
    path: ROUTES.PROJECTS,
    element: withLayout(ProjectsPage, {
      title: 'Proyectos',
      description: 'Descubre todos los proyectos inmobiliarios de IBYZA.',
    }),
  },
  {
    path: ROUTES.PROJECT_DETAIL,
    element: withLayout(ProjectDetailPage),
  },
  {
    path: ROUTES.SEPARACION,
    element: withLayout(SeparacionPage, {
      title: 'Separar departamento',
      description: 'Separa tu departamento disponible con Culqi o transferencia bancaria.',
    }),
  },
  {
    path: ROUTES.CONTACT,
    element: withLayout(ContactPage, {
      title: 'Contacto',
      description: 'Comunícate con nosotros o agenda una visita.',
    }),
  },
  {
    // Ruta 404
    path: '*',
    element: withLayout(NotFoundPage, {
      title: '404 — Página no encontrada',
    }),
  },
]);

export default router;
