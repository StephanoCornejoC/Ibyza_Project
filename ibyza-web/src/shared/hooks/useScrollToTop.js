import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook que hace scroll al tope de la página en cada cambio de ruta.
 * Si Lenis está activo, usa su API (lenis.scrollTo(0, { immediate: true }))
 * para que el reset funcione cuando Lenis intercepta el wheel.
 * Si no, cae al window.scrollTo nativo.
 */
const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const lenis = window.__lenis;
    if (lenis && typeof lenis.scrollTo === 'function') {
      lenis.scrollTo(0, { immediate: true, force: true });
      // Belt and suspenders: tambien reseteamos el scroll nativo, por si
      // Lenis no pudo resetear el offset interno todavia.
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname]);
};

export default useScrollToTop;
