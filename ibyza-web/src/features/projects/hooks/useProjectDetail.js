import { useState, useEffect } from 'react';
import api from '@/shared/services/api';
import useProjectStore from '@/shared/stores/useProjectStore';

/**
 * Hook para cargar el detalle de un proyecto específico.
 * Carga en paralelo: datos del proyecto, departamentos y avances.
 * Cachea cada resultado por slug en el store de Zustand.
 *
 * @param {string} slug - Slug del proyecto de la URL
 */
const useProjectDetail = (slug) => {
  const {
    getProjectFromCache,
    setProjectDetail,
    setProjectDepartments,
    setProjectAdvances,
  } = useProjectStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Leer del cache al montar
  const cached = getProjectFromCache(slug);
  const [project, setProject] = useState(cached?.data || null);
  const [departments, setDepartments] = useState(cached?.departments || []);
  const [advances, setAdvances] = useState(cached?.advances || []);

  useEffect(() => {
    if (!slug) return;

    // Si ya tenemos todos los datos en cache, no re-fetchar
    if (cached?.data && cached?.departments && cached?.advances) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        const [projectRes, deptRes, advRes] = await Promise.allSettled([
          api.get(`/api/proyectos/${slug}/`),
          api.get(`/api/proyectos/${slug}/departamentos/`),
          api.get(`/api/proyectos/${slug}/avances/`),
        ]);

        if (!isMounted) return;

        if (projectRes.status === 'fulfilled') {
          setProject(projectRes.value.data);
          setProjectDetail(slug, projectRes.value.data);
        } else {
          throw new Error('Proyecto no encontrado');
        }

        if (deptRes.status === 'fulfilled') {
          setDepartments(deptRes.value.data);
          setProjectDepartments(slug, deptRes.value.data);
        }

        if (advRes.status === 'fulfilled') {
          setAdvances(advRes.value.data);
          setProjectAdvances(slug, advRes.value.data);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAll();
    return () => { isMounted = false; };
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  return { project, departments, advances, loading, error };
};

export default useProjectDetail;
