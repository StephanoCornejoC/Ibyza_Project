import { useState, useEffect } from 'react';
import api from '@/shared/services/api';

/**
 * Hook para cargar el contenido del CMS de la pagina de inicio.
 * Consulta GET /api/contenido/?seccion=hero|nosotros
 * y GET /api/proyectos/ para el carrusel de proyectos.
 */
const useHomeContent = () => {
  const [heroContent, setHeroContent] = useState(null);
  const [aboutContent, setAboutContent] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        const [heroRes, nosotrosRes, projectsRes] = await Promise.allSettled([
          api.get('/api/contenido/', { params: { seccion: 'hero' } }),
          api.get('/api/contenido/', { params: { seccion: 'nosotros' } }),
          api.get('/api/proyectos/'),
        ]);

        if (!isMounted) return;

        // Procesar hero
        if (heroRes.status === 'fulfilled') {
          const items = heroRes.value.data?.results || heroRes.value.data || [];
          const obj = {};
          items.forEach((item) => { obj[item.clave] = item.valor; });
          setHeroContent(obj);
        }

        // Procesar nosotros
        if (nosotrosRes.status === 'fulfilled') {
          const items = nosotrosRes.value.data?.results || nosotrosRes.value.data || [];
          const obj = {};
          items.forEach((item) => { obj[item.clave] = item.valor; });
          setAboutContent(obj);
        }

        // Procesar proyectos — tomar todos los resultados
        if (projectsRes.status === 'fulfilled') {
          const data = projectsRes.value.data;
          const list = data?.results || data || [];
          setAllProjects(list);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAll();

    return () => { isMounted = false; };
  }, []);

  return { heroContent, aboutContent, allProjects, loading, error };
};

export default useHomeContent;
