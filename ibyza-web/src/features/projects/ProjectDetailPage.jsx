import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { MapPin, Calendar, Building2, Download, Play, ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';
import useProjectDetail from './hooks/useProjectDetail';
import { ProjectGallery } from './components/ProjectGallery';
import FloorPlanSpotlight from './components/FloorPlanSpotlight';
import InteractiveFloorPlan from './components/InteractiveFloorPlan';
import { DepartmentCard } from './components/DepartmentCard';
import { DepartmentModal } from './components/DepartmentModal';
import { ProgressUpdates } from './components/ProgressUpdates';
import { Badge } from '@/shared/components/ui/Badge';
import { Spinner } from '@/shared/components/ui/Spinner';
import { SectionTitle } from '@/shared/components/ui/SectionTitle';

/**
 * ProjectDetailPage — Página de detalle de un proyecto. ADN inconsarq.
 */
const ProjectDetailPage = () => {
  const { slug } = useParams();
  const { project, departments, advances, loading, error } =
    useProjectDetail(slug);
  const [detailModalDept, setDetailModalDept] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Scroll to top al entrar al detalle del proyecto
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  const openDetailModal = (dept) => {
    setDetailModalDept(dept);
    setDetailModalOpen(true);
  };

  if (loading) return <Spinner size="lg" centered />;

  if (error || !project) {
    return (
      <ErrorWrapper>
        <h2>Proyecto no encontrado</h2>
        <p>{error || 'El proyecto que buscas no existe o fue removido.'}</p>
      </ErrorWrapper>
    );
  }

  return (
    <>
      <Helmet>
        <title>{project.nombre} | IBYZA</title>
        <meta
          name="description"
          content={project.descripcion_corta || `Conoce el proyecto ${project.nombre} de IBYZA.`}
        />
      </Helmet>

      {/* Botón volver */}
      <BackLink to={ROUTES.PROJECTS} onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
        <ArrowLeft size={18} />
        Volver a Proyectos
      </BackLink>

      {/* Hero del proyecto */}
      <ProjectHero $bgImage={project.imagen_fachada}>
        <HeroOverlay />
        <HeroContent>
          <HeroBadge>
            <Badge status={project.estado || 'en_venta'} />
          </HeroBadge>
          <HeroTitle>{project.nombre}</HeroTitle>
          {(project.ubicacion || project.distrito) && (
            <HeroLocation>
              <MapPin size={16} />
              {project.ubicacion || `${project.distrito}, Arequipa`}
            </HeroLocation>
          )}
        </HeroContent>
        <HeroBottomLine />
      </ProjectHero>

      <PageContent>
        {/* Info general con chips glass */}
        <ProjectInfoSection>
          <InfoMain>
            <InfoGrid>
              {project.tipo_proyecto && (
                <InfoChip>
                  <Building2 size={16} />
                  <div>
                    <InfoLabel>Tipo</InfoLabel>
                    <InfoValue>{project.tipo_proyecto}</InfoValue>
                  </div>
                </InfoChip>
              )}
              {project.entrega_estimada && (
                <InfoChip>
                  <Calendar size={16} />
                  <div>
                    <InfoLabel>Entrega estimada</InfoLabel>
                    <InfoValue>{project.entrega_estimada}</InfoValue>
                  </div>
                </InfoChip>
              )}
            </InfoGrid>
            {project.descripcion && (
              <ProjectDescription>{project.descripcion}</ProjectDescription>
            )}

            {/* Botón de catálogo PDF */}
            {project.catalogo_pdf && (
              <CatalogButton
                href={project.catalogo_pdf}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                <Download size={18} />
                Descargar catálogo PDF
              </CatalogButton>
            )}
          </InfoMain>
        </ProjectInfoSection>

        {/* Videos de YouTube */}
        {project.videos && project.videos.length > 0 && (
          <VideosSection>
            <SectionTitle title="Videos" align="left" eyebrow="Recorrido virtual" />
            <VideosGrid>
              {project.videos.map((video) => (
                <VideoWrapper key={video.id || video.youtube_url}>
                  <iframe
                    src={video.youtube_url
                      .replace('watch?v=', 'embed/')
                      .replace('youtu.be/', 'youtube.com/embed/')}
                    title={video.titulo || 'Video del proyecto'}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </VideoWrapper>
              ))}
            </VideosGrid>
          </VideosSection>
        )}

        {/* Galería */}
        {project.galeria && project.galeria.length > 0 && (
          <GallerySection>
            <SectionTitle title="Galeria" align="left" eyebrow="Imagenes" />
            <ProjectGallery images={project.galeria} />
          </GallerySection>
        )}

        {/* Vista interactiva de niveles y departamentos */}
        {project.niveles && project.niveles.length > 0 && (
          <FloorPlanSection>
            <SectionTitle
              title="Niveles y departamentos"
              eyebrow="Distribucion"
              align="left"
              subtitle="Explora cada nivel y selecciona un departamento para ver su detalle."
            />
            <InteractiveFloorPlan niveles={project.niveles} project={project} />
          </FloorPlanSection>
        )}

        {/* Plano spotlight (fallback si hay plano_url pero no niveles) */}
        {project.plano_url && (!project.niveles || project.niveles.length === 0) && (
          <FloorPlanSection>
            <SectionTitle title="Plano del nivel" align="left" eyebrow="Distribucion" />
            <FloorPlanSpotlight src={project.plano_url} alt={`Plano ${project.nombre}`} />
          </FloorPlanSection>
        )}

        {/* Departamentos (vista cards, solo si no hay niveles interactivos) */}
        {departments && departments.length > 0 && (!project.niveles || project.niveles.length === 0) && (
          <DepartmentsSection>
            <SectionTitle
              title="Departamentos"
              eyebrow="Disponibilidad"
              align="left"
              subtitle="Selecciona un departamento para ver su detalle o separarlo."
            />
            <DepartmentsGrid>
              {departments.map((dept) => (
                <DepartmentCard
                  key={dept.id}
                  department={dept}
                  project={project}
                  onViewDetail={openDetailModal}
                />
              ))}
            </DepartmentsGrid>
          </DepartmentsSection>
        )}

        {/* Departamentos cards (vista complementaria si hay niveles) */}
        {departments && departments.length > 0 && project.niveles && project.niveles.length > 0 && (
          <DepartmentsSection>
            <SectionTitle
              title="Todos los departamentos"
              eyebrow="Vista general"
              align="left"
            />
            <DepartmentsGrid>
              {departments.map((dept) => (
                <DepartmentCard
                  key={dept.id}
                  department={dept}
                  project={project}
                  onViewDetail={openDetailModal}
                />
              ))}
            </DepartmentsGrid>
          </DepartmentsSection>
        )}

        {/* Avances de obra */}
        {advances && advances.length > 0 && (
          <ProgressSection>
            <ProgressUpdates advances={advances} />
          </ProgressSection>
        )}
      </PageContent>

      <DepartmentModal
        department={detailModalDept}
        project={project}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
      />

      {/* SeparationModal montado globalmente en Layout — no duplicar aqui */}
    </>
  );
};

const ProjectHero = styled.div`
  position: relative;
  height: 460px;
  background-color: ${({ theme }) => theme.colors.deepBg};
  background-image: ${({ $bgImage }) =>
    $bgImage ? `url(${$bgImage})` : 'none'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;

  ${({ theme }) => theme.media.tablet} {
    height: 380px;
  }

  ${({ theme }) => theme.media.mobile} {
    height: 300px;
  }
`;

const HeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    ${({ theme }) => theme.colors.deepBg} 0%,
    rgba(8,19,31,0.55) 50%,
    rgba(8,19,31,0.2) 100%
  );
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  padding: ${({ theme }) => `${theme.spacing.xxl} ${theme.spacing.lg}`};
  max-width: ${({ theme }) => theme.container.maxWidth};
  margin: 0 auto;
  width: 100%;

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.md}`};
  }
`;

const HeroBadge = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const HeroTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['5xl']};
  font-weight: 900;
  letter-spacing: -3px;
  line-height: 1;
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-shadow: 0 2px 20px rgba(0,0,0,0.4);

  ${({ theme }) => theme.media.tablet} {
    font-size: 2.5rem;
    letter-spacing: -1px;
  }

  ${({ theme }) => theme.media.mobile} {
    font-size: 1.75rem;
    letter-spacing: 0;
  }
`;

const HeroLocation = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 300;

  svg {
    color: ${({ theme }) => theme.colors.gold};
    opacity: 0.9;
  }
`;

const HeroBottomLine = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: ${({ theme }) => theme.gradients.goldDivider};
  opacity: 0.5;
  z-index: 2;
`;

const PageContent = styled.div`
  max-width: ${({ theme }) => theme.container.maxWidth};
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.section} ${theme.spacing.lg}`};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.section};

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => `${theme.spacing.xxxl} ${theme.spacing.md}`};
    gap: ${({ theme }) => theme.spacing.xxxl};
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => `${theme.spacing.xxl} ${theme.spacing.md}`};
    gap: ${({ theme }) => theme.spacing.xxl};
  }
`;

const ProjectInfoSection = styled.div``;

const InfoMain = styled.div``;

const InfoGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const InfoChip = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.colors.borderGold};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  color: ${({ theme }) => theme.colors.gold};

  svg { flex-shrink: 0; opacity: 0.8; }
`;

const InfoLabel = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const InfoValue = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white};
`;

const ProjectDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.85;
  max-width: 760px;
`;

const GallerySection = styled.div``;

const FloorPlanSection = styled.div``;

const DepartmentsSection = styled.div``;

const DepartmentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;

const CatalogButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
  background: ${({ theme }) => theme.gradients?.gold || '#D6B370'};
  color: ${({ theme }) => theme.colors.deepBg};
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  border-radius: ${({ theme }) => theme.radii?.md || '8px'};
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(214, 179, 112, 0.4);
  }
`;

const VideosSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.section};
`;

const VideosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 400px), 1fr));
  gap: ${({ theme }) => theme.spacing.lg};

  ${({ theme }) => theme.media?.tablet} {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const VideoWrapper = styled.div`
  width: 100%;
  height: 0;
  padding-bottom: 56.25%;
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.glass?.border || 'rgba(255,255,255,0.1)'};

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;

const ProgressSection = styled.div``;

const ErrorWrapper = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.section};

  h2 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: ${({ theme }) => theme.fontSizes['3xl']};
    font-weight: 900;
    letter-spacing: -1px;
    color: ${({ theme }) => theme.colors.white};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: 300;
  }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  margin: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.lg} 0`};
  color: ${({ theme }) => theme.colors.gold};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 2px;
  transition: all 0.25s ease;
  border-radius: ${({ theme }) => theme.radii.md};

  &:hover {
    background: rgba(214,179,112,0.08);
    transform: translateX(-4px);
  }

  ${({ theme }) => theme.media.mobile} {
    margin: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.md} 0`};
    letter-spacing: 1.5px;
    padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  }
`;

export default ProjectDetailPage;
