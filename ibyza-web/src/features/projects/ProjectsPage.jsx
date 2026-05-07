import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { FilterBar } from './components/FilterBar';
import { ProjectsGrid } from './components/ProjectsGrid';
import useProjects from './hooks/useProjects';

// --- Styled Components ---

const ContentWrapper = styled.div`
  max-width: ${({ theme }) => theme.container.maxWidth};
  margin: 0 auto;
  // Padding-top extra para compensar la altura del navbar fixed (sin hero).
  padding: ${({ theme }) =>
    `calc(${theme.spacing.xxxl} + 80px) ${theme.spacing.lg} ${theme.spacing.section}`};

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) =>
      `calc(${theme.spacing.xxl} + 70px) ${theme.spacing.md} ${theme.spacing.xxxl}`};
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) =>
      `calc(${theme.spacing.xl} + 64px) ${theme.spacing.md} ${theme.spacing.xxl}`};
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

      <ContentWrapper>
        <FilterBar />
        <ProjectsGrid projects={projects} loading={loading} error={error} />
      </ContentWrapper>
    </>
  );
};

export default ProjectsPage;
