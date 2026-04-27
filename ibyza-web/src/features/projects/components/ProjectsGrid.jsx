import styled from 'styled-components';
import { ProjectCard } from './ProjectCard';
import { Spinner } from '@/shared/components/ui/Spinner';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { Building2 } from 'lucide-react';

/**
 * ProjectsGrid — Grilla de tarjetas de proyectos. ADN inconsarq.
 *
 * Props:
 * - projects: array de proyectos
 * - loading: boolean
 * - error: string | null
 */
export const ProjectsGrid = ({ projects, loading, error }) => {
  if (loading) return <Spinner size="lg" centered />;

  if (error) {
    return (
      <EmptyState
        title="Error al cargar proyectos"
        description={error}
      />
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="Sin proyectos disponibles"
        description="No se encontraron proyectos que coincidan con tu busqueda."
      />
    );
  }

  return (
    <Grid>
      {projects.map((project, index) => (
        <ProjectCard key={project.id} project={project} index={index} />
      ))}
    </Grid>
  );
};

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.xl};

  ${({ theme }) => theme.media.desktop} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${({ theme }) => theme.media.tablet} {
    grid-template-columns: 1fr;
  }
`;

export default ProjectsGrid;
