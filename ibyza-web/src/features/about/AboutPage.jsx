import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '@/shared/services/api';
import AboutHero from './components/AboutHero';
import MisionVisionCards from './components/MisionVisionCards';
import ValuesCarousel from './components/ValuesCarousel';
import CTASection from '@/features/home/components/CTASection';

/**
 * AboutPage — Pagina "Nosotros" de IBYZA.
 * Secciones: Hero 100vh → Mision/Vision/Compromiso → Valores carrusel → CTA
 * Todo el contenido se carga desde el CMS.
 */
const AboutPage = () => {
  const [content, setContent] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await api.get('/api/contenido/', { params: { seccion: 'nosotros' } });
        const items = res.data?.results || res.data || [];
        const obj = {};
        items.forEach((item) => {
          obj[item.clave] = item.valor;
          if (item.imagen) obj[`imagen_${item.clave}`] = item.imagen;
        });
        setContent(obj);
      } catch {
        // Fallback a contenido por defecto
      }
    };
    fetchContent();
  }, []);

  return (
    <>
      <Helmet>
        <title>Nosotros | IBYZA</title>
        <meta
          name="description"
          content="Conoce la historia, mision, vision y valores de IBYZA. Una inmobiliaria comprometida con la calidad."
        />
      </Helmet>

      <AboutHero content={content} />

      <MisionVisionCards content={content} />

      <ValuesCarousel />

      <CTASection />
    </>
  );
};

export default AboutPage;
