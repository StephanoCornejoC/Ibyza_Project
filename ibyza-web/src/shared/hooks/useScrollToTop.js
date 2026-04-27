import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook que hace scroll al tope de la página en cada cambio de ruta.
 * Se usa en App.jsx para que cada navegación empiece desde arriba.
 */
const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
};

export default useScrollToTop;
