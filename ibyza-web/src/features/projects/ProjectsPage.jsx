import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { SectionTitle } from '@/shared/components/ui/SectionTitle';
import heroFallback from '@/assets/images/hero-projects-pexels.jpg';
const HERO_FALLBACK = heroFallback;
import { FilterBar } from './components/FilterBar';
import { ProjectsGrid } from './components/ProjectsGrid';
import useProjects from './hooks/useProjects';

// --- Styled Components ---

const PageHeader = styled.div`
  background-color: ${({ theme }) => theme.colors.deepBg};
  background-image: url(${HERO_FALLBACK});
  background-size: cover;
  background-position: center;
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const HeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(8,19,31,0.8) 0%, rgba(8,19,31,0.65) 50%, rgba(8,19,31,0.85) 100%);
  z-index: 0;
`;

const GridPattern = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
`;

const GoldGlow = styled.div`
  position: absolute;
  top: -20%;
  right: 10%;
  width: clamp(260px, 50vw, 500px);
  height: clamp(260px, 50vw, 500px);
  background: radial-gradient(circle, rgba(214,179,112,0.04) 0%, transparent 65%);
  pointer-events: none;
`;

const GoldDividerTop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: ${({ theme }) => theme.gradients.goldDivider};
  opacity: 0.5;
`;

const GoldDividerBottom = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: ${({ theme }) => theme.gradients.goldDivider};
  opacity: 0.5;
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: ${({ theme }) => theme.container.maxWidth};
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  width: 100%;

  ${({ theme }) => theme.media.mobile} {
    padding: 0 ${({ theme }) => theme.spacing.md};
  }
`;

const ContentWrapper = styled.div`
  max-width: ${({ theme }) => theme.container.maxWidth};
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.section} ${theme.spacing.lg}`};

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => `${theme.spacing.xxxl} ${theme.spacing.md}`};
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => `${theme.spacing.xxl} ${theme.spacing.md}`};
  }
`;

// --- Componente ---

const ProjectsPage = () => {
  const { projects, loading, error } = useProjects();

  return (
    <>
      <Helmet>
        <title>Proyectos | IBYZA</title>
        <meta
          name="description"
          content="Explora todos los proyectos inmobiliarios de IBYZA. Departamentos disponibles en las mejores ubicaciones de Arequipa."
        />
      </Helmet>

      <PageHeader>
        <HeroOverlay />
        <GridPattern />
        <GoldGlow />
        <GoldDividerTop />
        <HeaderContent>
          <SectionTitle
            eyebrow="Portafolio"
            title="Nuestros proyectos"
            subtitle="Encuentra el departamento ideal para ti y tu familia."
            light
          />
        </HeaderContent>
        <GoldDividerBottom />
      </PageHeader>

      <ContentWrapper>
        <FilterBar />
        <ProjectsGrid projects={projects} loading={loading} error={error} />
      </ContentWrapper>
    </>
  );
};

export default ProjectsPage;
