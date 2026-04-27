import { Helmet } from 'react-helmet-async';
import useHomeContent from './hooks/useHomeContent';
import HeroSection from './components/HeroSection';
import AboutPreview from './components/AboutPreview';
import ProjectsCarousel from './components/ProjectsCarousel';
import CTASection from './components/CTASection';

/**
 * HomePage — Pagina de inicio de IBYZA.
 * Secciones: Hero → Quienes Somos → Carrusel Proyectos → CTA Contacto.
 */
const HomePage = () => {
  const { heroContent, aboutContent, allProjects, loading, error } =
    useHomeContent();

  return (
    <>
      <Helmet>
        <title>IBYZA — Proyectos Inmobiliarios en Arequipa</title>
        <meta
          name="description"
          content="IBYZA — Construimos departamentos de calidad en las mejores ubicaciones de Arequipa. Conoce nuestros proyectos disponibles."
        />
      </Helmet>

      {/* Seccion 1: Hero con logo + slogan */}
      <HeroSection content={heroContent} />

      {/* Seccion 2: Quienes Somos (preview) */}
      <AboutPreview content={aboutContent} />

      {/* Seccion 3: Carrusel de proyectos */}
      <ProjectsCarousel projects={allProjects} loading={loading} />

      {/* Seccion 4: CTA hacia contacto */}
      <CTASection />
    </>
  );
};

export default HomePage;
