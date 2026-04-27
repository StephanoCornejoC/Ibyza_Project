import useScrollToTop from '@/shared/hooks/useScrollToTop';

/**
 * ScrollToTop — Componente que envuelve el hook useScrollToTop.
 * Se usa dentro del contexto del RouterProvider para hacer scroll
 * al tope en cada cambio de ruta.
 */
const ScrollToTop = () => {
  useScrollToTop();
  return null;
};

export default ScrollToTop;
