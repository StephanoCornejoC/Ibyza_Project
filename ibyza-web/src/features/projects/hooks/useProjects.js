import { useState, useEffect } from 'react';
import api from '@/shared/services/api';
import useProjectStore from '@/shared/stores/useProjectStore';

/**
 * Hook para cargar la lista de proyectos.
 * Usa el store de Zustand como cache — si los proyectos ya fueron cargados
 * en la sesión, no vuelve a hacer el fetch.
 */
const useProjects = () => {
  const { projects, projectsLoaded, setProjects, filters } = useProjectStore();
  const [loading, setLoading] = useState(!projectsLoaded);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si ya están cacheados, no re-fetchar
    if (projectsLoaded) return;

    let isMounted = true;

    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/api/proyectos/');
        if (isMounted) {
          // Normalizar respuesta: acepta array directo o respuesta paginada de DRF { results: [] }
          const data = Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
          setProjects(data);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProjects();
    return () => { isMounted = false; };
  }, [projectsLoaded, setProjects]);

  // Aplicar filtro por estado del proyecto
  const safeProjects = Array.isArray(projects) ? projects : [];
  const filteredProjects = safeProjects.filter((p) => {
    return !filters.estado || p.estado === filters.estado;
  });

  return { projects: filteredProjects, allProjects: projects, loading, error };
};

export default useProjects;
