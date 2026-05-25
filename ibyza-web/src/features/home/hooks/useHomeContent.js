import { useState, useEffect } from 'react';
import api from '@/shared/services/api';

/**
 * Hook para cargar el contenido del CMS de la pagina de inicio.
 *
 * Consulta GET /api/contenido/?pagina=inicio  -> trae TODOS los entries del Home
 * (Hero + Quienes Somos). Splittea por seccion en heroContent/aboutContent para
 * que los componentes existentes no cambien su API.
 *
 * Tambien GET /api/proyectos/ para el carrusel.
 *
 * Nota sobre la imagen: el backend devuelve `imagen` en cada entry. Si el item
 * tiene una imagen (por ejemplo, el hero), se expone como `imagen_<clave>` para
 * que el componente la pueda leer sin colisionar con el texto.
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

        const [contenidoRes, projectsRes] = await Promise.allSettled([
          api.get('/api/contenido/', { params: { pagina: 'inicio' } }),
          api.get('/api/proyectos/'),
        ]);

        if (!isMounted) return;

        // Procesar contenido del Home: split por seccion.
        // Convencion: la `clave` del entry es exactamente el nombre del
        // campo que el componente del frontend espera leer:
        //   - clave="titulo"        -> content.titulo
        //   - clave="imagen_fondo"  -> content.imagen_fondo (URL de imagen)
        //   - clave="imagen_hero"   -> content.imagen_hero  (URL de imagen)
        // El entry usa `valor` (texto) O `imagen` (URL), no ambos.
        if (contenidoRes.status === 'fulfilled') {
          const items = contenidoRes.value.data?.results || contenidoRes.value.data || [];
          const hero = {};
          const about = {};
          items.forEach((item) => {
            const target = item.seccion === 'hero' ? hero : about;
            // Si el entry tiene imagen subida, esa URL es el valor de la clave.
            // Si no, usar el texto del `valor`.
            target[item.clave] = item.imagen || item.valor;
          });
          setHeroContent(hero);
          setAboutContent(about);
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
