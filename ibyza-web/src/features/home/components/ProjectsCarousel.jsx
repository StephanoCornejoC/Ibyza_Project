import { Link } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { motion } from 'framer-motion'
import { ArrowRight, Building2 } from 'lucide-react'
import { SectionTitle } from '@/shared/components/ui/SectionTitle'
import { Badge } from '@/shared/components/ui/Badge'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Button } from '@/shared/components/ui/Button'
import { buildProjectDetailRoute, ROUTES } from '@/shared/constants/routes'
import { formatPriceUSD } from '@/shared/utils/formatters'
import { Spinner } from '@/shared/components/ui/Spinner'

/**
 * ProjectsCarousel — Marquee horizontal infinito con CSS animation pura.
 *
 * Implementacion:
 *  - El array se duplica para que la animacion translateX(-50%) loop
 *    seamless (cuando llega al final, vuelve al inicio sin salto visible).
 *  - El movimiento es CSS @keyframes con transform: translateX, no rAF.
 *    Eso es GPU-accelerated, funciona identico en mobile y desktop, y
 *    no compite con el touch del usuario.
 *  - Las cards son clickables (el click event funciona aunque el track
 *    este animado).
 *  - Hover NO pausa: el cliente pidio que la animacion siga corriendo.
 */

const ProjectsCarousel = ({ projects, loading }) => {
  // Duplicamos el array para que -50% loop sin saltos visibles.
  const doubled = projects && projects.length
    ? [...projects, ...projects]
    : []

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

  return (
    <Section>
      <SectionTitle
        eyebrow="Proyectos disponibles"
        title="Invierte en tu futuro"
        subtitle="Conoce nuestros proyectos con departamentos disponibles."
        light
      />

      <Marquee>
        <Track>
          {doubled.map((project, idx) => (
            <SlideCard
              key={`${project.id}-${idx}`}
              data-card
              as={Link}
              to={buildProjectDetailRoute(project.slug)}
            >
              <CardImage>
                {project.imagen_fachada ? (
                  <img
                    src={project.imagen_fachada}
                    alt={project.nombre}
                    loading="lazy"
                  />
                ) : (
                  <ImagePlaceholder />
                )}
                <CardOverlay />
                <CardBadge>
                  <Badge status={project.estado || 'en_venta'} />
                </CardBadge>
              </CardImage>
              <CardBody>
                <CardLocation>
                  {project.ubicacion?.split(',').pop()?.trim() || 'Arequipa'}
                </CardLocation>
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
      </Marquee>

      <CtaRow
        as={motion.div}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <Button as={Link} to={ROUTES.PROJECTS} variant="outline" size="lg">
          Ver todos los proyectos
          <ArrowRight size={16} />
        </Button>
      </CtaRow>
    </Section>
  )
}

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

// Animacion marquee infinita: traslada el track de 0 a -50% (porque el array
// se duplica). Cuando llega a -50%, vuelve a 0 que visualmente es el mismo
// punto -> loop seamless.
const marqueeAnimation = keyframes`
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(-50%, 0, 0); }
`

const Marquee = styled.div`
  position: relative;
  max-width: ${({ theme }) => theme.container.maxWidth};
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.xl} 0`};
  overflow: hidden;
  // Hint al browser: vamos a animar el contenido. Lo deja en su propia capa.
  contain: paint;

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => `${theme.spacing.lg} 0`};
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => `${theme.spacing.md} 0`};
  }
`

const Track = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 20px;
  width: max-content;
  animation: ${marqueeAnimation} 60s linear infinite;
  will-change: transform;

  // Mobile: animacion mas rapida (cards mas chicas, queremos que se note).
  ${({ theme }) => theme.media.mobile} {
    animation-duration: 40s;
  }

  // Si el usuario tiene reduce-motion, dejamos el track quieto pero
  // accesible (puede scrollear si quiere — agregamos overflow visible).
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const SlideCard = styled.a`
  flex: 0 0 auto;
  width: clamp(220px, 22vw, 360px);
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.glass.border};
  border-radius: 14px;
  overflow: hidden;
  text-decoration: none;
  transition: border-color 0.35s ease, box-shadow 0.35s ease, transform 0.35s ease;
  display: flex;
  flex-direction: column;

  // Cada card es un snap point en touch. Solo aplica cuando el Track
  // activa scroll-snap-type (pointer: coarse).
  @media (pointer: coarse) {
    scroll-snap-align: start;
  }

  /* Mobile: ~2-2.5 cards */
  @media (max-width: 480px) {
    width: 240px;
  }

  /* Tablet (~768): ~3 cards */
  @media (min-width: 768px) and (max-width: 1023px) {
    width: 280px;
  }

  /* Laptop (~1024-1599): ~4-5 cards */
  @media (min-width: 1024px) and (max-width: 1599px) {
    width: clamp(240px, 18vw, 300px);
  }

  /* Desktop grande (1600+): 5-6+ cards, escala con el viewport */
  @media (min-width: 1600px) {
    width: clamp(260px, 16vw, 360px);
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderGold};
    box-shadow: ${({ theme }) => theme.glass.shadowGold}, 0 20px 60px rgba(0,0,0,0.4);
    transform: translateY(-6px);
  }
`

const CardImage = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
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
    aspect-ratio: 3 / 4;
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
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  flex: 1;

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
`

const CardTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: 900;
  letter-spacing: -1px;
  color: ${({ theme }) => theme.colors.white};
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
  flex: 1;
`

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.glass.border};
  margin-top: ${({ theme }) => theme.spacing.sm};
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

const CtaRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.xl};
`

export default ProjectsCarousel
