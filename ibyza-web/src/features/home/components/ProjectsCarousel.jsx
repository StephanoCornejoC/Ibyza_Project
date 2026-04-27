import { Link } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { motion } from 'framer-motion'
import { ArrowRight, Building2 } from 'lucide-react'
import { SectionTitle } from '@/shared/components/ui/SectionTitle'
import { Badge } from '@/shared/components/ui/Badge'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { buildProjectDetailRoute } from '@/shared/constants/routes'
import { formatPriceUSD } from '@/shared/utils/formatters'
import { Spinner } from '@/shared/components/ui/Spinner'

/**
 * ProjectsCarousel — Carrusel infinito que muestra 2 proyectos a la vez.
 * Se triplica la lista para loop seamless via CSS animation.
 */
const ProjectsCarousel = ({ projects, loading }) => {
  if (loading) return <Spinner size="lg" centered />
  if (!projects || projects.length === 0) {
    return (
      <Section>
        <SectionTitle
          eyebrow="Proyectos disponibles"
          title="Invierte en tu futuro"
          subtitle="Conoce nuestros proyectos con departamentos disponibles."
          light
        />
        <EmptyState
          icon={Building2}
          title="Sin proyectos disponibles"
          description="Pronto tendremos nuevos proyectos para ti. Mantente atento."
        />
      </Section>
    )
  }

  // Triplicar para loop seamless (se anima -33.33% para volver al inicio sin salto)
  const items = [...projects, ...projects, ...projects]

  return (
    <Section>
      <SectionTitle
        eyebrow="Proyectos disponibles"
        title="Invierte en tu futuro"
        subtitle="Conoce nuestros proyectos con departamentos disponibles."
        light
      />

      <CarouselWrapper>
        <Track $count={projects.length}>
          {items.map((project, i) => (
            <SlideCard
              key={`${project.id}-${i}`}
              as={Link}
              to={buildProjectDetailRoute(project.slug)}
            >
              <CardImage>
                {project.imagen_fachada ? (
                  <img src={project.imagen_fachada} alt={project.nombre} loading="lazy" />
                ) : (
                  <ImagePlaceholder />
                )}
                <CardOverlay />
                <CardBadge>
                  <Badge status={project.estado || 'en_venta'} />
                </CardBadge>
              </CardImage>
              <CardBody>
                <CardLocation>{project.ubicacion?.split(',').pop()?.trim() || 'Arequipa'}</CardLocation>
                <CardTitle>{project.nombre}</CardTitle>
                <CardDesc>{project.descripcion_corta}</CardDesc>
                <CardFooter>
                  {project.precio_desde && (
                    <PriceTag>
                      <span>Desde</span>
                      <strong>{formatPriceUSD(project.precio_desde)}</strong>
                    </PriceTag>
                  )}
                  <CardArrow>
                    <ArrowRight size={16} />
                  </CardArrow>
                </CardFooter>
              </CardBody>
            </SlideCard>
          ))}
        </Track>
      </CarouselWrapper>
    </Section>
  )
}

// --- Animacion: se mueve exactamente 1/3 del total (un set completo) ---
const scroll = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(calc(-100% / 3)); }
`

const Section = styled.section`
  padding: ${({ theme }) => `${theme.spacing.section} 0`};
  background: ${({ theme }) => theme.gradients.section};
  overflow: hidden;

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => `${theme.spacing.xxxl} 0`};
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => `${theme.spacing.xxl} 0`};
  }
`

const CarouselWrapper = styled.div`
  width: 100%;
  overflow: hidden;
  padding: ${({ theme }) => `${theme.spacing.lg} 0`};
  mask-image: linear-gradient(90deg, transparent 0%, black 5%, black 95%, transparent 100%);
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 5%, black 95%, transparent 100%);
`

const Track = styled.div`
  display: flex;
  gap: 2rem;
  width: max-content;
  animation: ${scroll} ${({ $count }) => Math.max($count * 5, 15)}s linear infinite;

  &:hover {
    animation-play-state: paused;
  }

  ${({ theme }) => theme.media.tablet} {
    gap: 1.25rem;
  }

  ${({ theme }) => theme.media.mobile} {
    gap: 1rem;
  }
`

const SlideCard = styled.a`
  flex-shrink: 0;
  width: clamp(280px, 50vw, 560px);
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.glass.border};
  border-radius: 14px;
  overflow: hidden;
  text-decoration: none;
  transition: all 0.35s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderGold};
    box-shadow: ${({ theme }) => theme.glass.shadowGold}, 0 20px 60px rgba(0,0,0,0.4);
    transform: translateY(-6px);
  }

  ${({ theme }) => theme.media.tablet} {
    width: clamp(280px, 70vw, 420px);
  }

  ${({ theme }) => theme.media.mobile} {
    width: 82vw;
    max-width: 340px;
    min-width: 260px;
  }
`

const CardImage = styled.div`
  position: relative;
  height: 220px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.primary};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }

  ${SlideCard}:hover & img {
    transform: scale(1.06);
  }

  ${({ theme }) => theme.media.tablet} {
    height: 200px;
  }

  ${({ theme }) => theme.media.mobile} {
    height: 170px;
  }
`

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, rgba(13,31,51,0.6) 100%);
`

const CardOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: ${({ theme }) => theme.gradients.cardOverlay};
  pointer-events: none;
`

const CardBadge = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
`

const CardBody = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.md};
  }
`

const CardLocation = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.eyebrow};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: ${({ theme }) => theme.colors.gold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const CardTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: 900;
  letter-spacing: -1px;
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const CardDesc = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.glass.border};
`

const PriceTag = styled.div`
  span {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.textMuted};
    display: block;
  }
  strong {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    font-weight: 700;
    background: ${({ theme }) => theme.gradients.goldText};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`

const CardArrow = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(214,179,112,0.1);
  border: 1px solid rgba(214,179,112,0.2);
  color: ${({ theme }) => theme.colors.gold};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  ${SlideCard}:hover & {
    background: ${({ theme }) => theme.gradients.gold};
    border: none;
    color: ${({ theme }) => theme.colors.deepBg};
  }
`

export default ProjectsCarousel
