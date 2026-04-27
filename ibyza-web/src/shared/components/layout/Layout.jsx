import { Suspense, lazy } from 'react';
import styled from 'styled-components';
import { Helmet } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PageLoader } from '@/shared/components/feedback/PageLoader';
import WhatsAppButton from '@/shared/components/ui/WhatsAppButton';
import CustomCursor from '@/shared/components/ui/CustomCursor';
import ScrollProgress from '@/shared/components/ui/ScrollProgress';
import useScrollToTop from '@/shared/hooks/useScrollToTop';
import { useLenis } from '@/shared/hooks/useLenis';
import useUIStore from '@/shared/stores/useUIStore';

// Modal global de separacion — cargado lazy para no bloquear el render inicial
const SeparationModal = lazy(() => import('@/features/separation/SeparationModal'));

/**
 * Layout — Envuelve todas las páginas con Navbar, Footer y transiciones.
 *
 * Props:
 * - children: ReactNode
 * - title: string — título de la página para el <head>
 * - description: string — meta description para la página
 * - noFooter: boolean — ocultar footer (útil para páginas especiales)
 */
export const Layout = ({
  children,
  title,
  description,
  noFooter = false,
}) => {
  const location = useLocation();

  // Scroll suave con Lenis
  useLenis();

  // Scroll al tope en cada cambio de ruta
  useScrollToTop();

  const pageTitle = title ? `${title} | IBYZA` : 'IBYZA — Inmobiliaria';
  const pageDescription =
    description ||
    'IBYZA — Proyectos inmobiliarios de calidad. Descubre nuestros departamentos disponibles.';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
      </Helmet>

      {/* Cursor personalizado (solo desktop) */}
      <CustomCursor />

      {/* Barra de progreso de scroll */}
      <ScrollProgress />

      <Navbar />

      <Main>
        {/* Transición suave entre páginas */}
        <AnimatePresence mode="wait">
          <PageTransition
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Suspense fallback={<PageLoader />}>
              {children}
            </Suspense>
          </PageTransition>
        </AnimatePresence>
      </Main>

      {!noFooter && <Footer />}
      <WhatsAppButton />

      {/* Modal global de separacion — disponible desde cualquier pagina */}
      <GlobalSeparationModal />
    </>
  );
};

/**
 * GlobalSeparationModal — Montado una sola vez en Layout, escucha el store.
 * Se abre cuando cualquier componente llama openSeparationModal(dept, project).
 */
const GlobalSeparationModal = () => {
  const { separationModalOpen, closeSeparationModal, selectedDepartment, selectedProject } =
    useUIStore();

  if (!separationModalOpen) return null;

  return (
    <Suspense fallback={null}>
      <SeparationModal
        isOpen={separationModalOpen}
        onClose={closeSeparationModal}
        department={selectedDepartment}
        project={selectedProject}
      />
    </Suspense>
  );
};

const Main = styled.main`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.deepBg};
`;

const PageTransition = styled(motion.div)`
  will-change: opacity, transform;
`;

export default Layout;
