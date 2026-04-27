import { useState, useEffect } from 'react';

/**
 * Hook para detectar si una media query está activa.
 * Permite condicionar lógica en JavaScript basada en breakpoints.
 *
 * Uso:
 *   const isMobile = useMediaQuery('(max-width: 768px)');
 *   const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
 *
 * @param {string} query - Media query string
 * @returns {boolean}
 */
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    // Verificar soporte de matchMedia (SSR safety)
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueryList = window.matchMedia(query);
    const handleChange = (event) => setMatches(event.matches);

    // Usar addEventListener moderno (addListener está deprecado)
    mediaQueryList.addEventListener('change', handleChange);

    // Sincronizar en caso de que haya cambiado antes del effect
    setMatches(mediaQueryList.matches);

    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};

export default useMediaQuery;
