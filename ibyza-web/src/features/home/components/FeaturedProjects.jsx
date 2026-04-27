import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { SectionTitle } from '@/shared/components/ui/SectionTitle'
import { Spinner } from '@/shared/components/ui/Spinner'
import { buildProjectDetailRoute } from '@/shared/constants/routes'
import { formatPriceUSD } from '@/shared/utils/formatters'
import { Badge } from '@/shared/components/ui/Badge'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { ROUTES } from '@/shared/constants/routes'
import { staggerContainer, fadeInUp, scaleIn } from '@/shared/utils/animations'

/**
 * FeaturedProjects — Muestra hasta 3 proyectos destacados en la Home.
 * - Grid con stagger animation al entrar en viewport
 * - Cards con efecto tilt 3D y hover premium
 * - Auto-play carousel opcional en mobile
 */
const FeaturedProjects = ({ projects, loading, error }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const autoPlayRef = useRef(null)
  const isHovering = useRef(false)

  // Auto-play en mobile (carousel)
  useEffect(() => {
    if (!projects || projects.length <= 1) return
    autoPlayRef.current = setInterval(() => {
      if (!isHovering.current) {
        setDirection(1)
        setActiveIndex((i) => (i + 1) % projects.length)
      }
    }, 5000)
    return () => clearInterval(autoPlayRef.current)
  }, [projects])

  const goTo = (idx) => {
    setDirection(idx > activeIndex ? 1 : -1)
    setActiveIndex(idx)
  }

  const prev = () => {
    setDirection(-1)
    setActiveIndex((i) => (i === 0 ? projects.length - 1 : i - 1))
  }

  const next = () => {
    setDirection(1)
    setActiveIndex((i) => (i + 1) % projects.length)
  }

  if (loading) return <Spinner size="lg" centered />
  if (error) return <ErrorMsg>No se pudieron cargar los proyectos.</ErrorMsg>

  return (
    <Section id="featured-projects">
      <SectionTitle
        eyebrow="Nuestros proyectos"
        title="Descubre donde vivir"
        subtitle="Departamentos diseñados para el estilo de vida que buscas."
      />

      {/* Grid desktop con stagger */}
      <ProjectsGrid
        as={motion.div}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        {projects.map((project, index) => (
          <motion.div key={project.id} variants={fadeInUp}>
            <ProjectCard3D project={project} index={index} />
          </motion.div>
        ))}
      </ProjectsGrid>

      {/* Carousel controls (visible en mobile) */}
      {projects.length > 1 && (
        <CarouselControls>
          <CarouselBtn onClick={prev} aria-label="Proyecto anterior">
            <ChevronLeft size={20} />
          </CarouselBtn>
          <DotsRow>
            {projects.map((_, i) => (
              <Dot key={i} $active={i === activeIndex} onClick={() => goTo(i)} />
            ))}
          </DotsRow>
          <CarouselBtn onClick={next} aria-label="Siguiente proyecto">
            <ChevronRight size={20} />
          </CarouselBtn>
        </CarouselControls>
      )}

      <CTAWrapper
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <ViewAllLink as={Link} to={ROUTES.PROJECTS}>
          Ver todos los proyectos
          <ArrowRight size={16} />
        </ViewAllLink>
      </CTAWrapper>
    </Section>
  )
}

/** ProjectCard con efecto tilt 3D */
const ProjectCard3D = ({ project }) => {
  const cardRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e) => {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches) return
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12
    const y = -((e.clientY - rect.top) / rect.height - 0.5) * 12
    setTilt({ x, y })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
    setIsHovered(false)
  }

  return (
    <CardWrapper
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        transition: isHovered ? 'transform 0.1s ease' : 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      <ProjectCard as={Link} to={buildProjectDetailRoute(project.slug)} $hovered={isHovered}>
        <CardAccent $hovered={isHovered} />

        <CardImage>
          {project.imagen_fachada ? (
            <img
              src={project.imagen_fachada}
              alt={project.nombre}
              loading="lazy"
              style={{ transform: isHovered ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)' }}
            />
          ) : (
            <ImagePlaceholder />
          )}
          <ImageOverlay />
          <CardBadge>
            <Badge status={project.estado || 'en_venta'} />
          </CardBadge>
        </CardImage>

        <CardBody>
          <CardLocation>{project.ubicacion || 'Arequipa'}</CardLocation>
          <CardTitle>{project.nombre}</CardTitle>
          <CardDivider />
          <CardDescription>{project.descripcion_corta}</CardDescription>

          <CardFooter>
            {project.precio_desde && (
              <PriceTag>
                <PriceLabel>Desde</PriceLabel>
                <PriceValue>{formatPriceUSD(project.precio_desde)}</PriceValue>
              </PriceTag>
            )}
            <CardArrow $hovered={isHovered}>
              <ArrowRight size={16} />
            </CardArrow>
          </CardFooter>
        </CardBody>
      </ProjectCard>
    </CardWrapper>
  )
}

const Section = styled.section`
  padding: ${({ theme }) => `${theme.spacing.section} ${theme.spacing.lg}`};
  max-width: ${({ theme }) => theme.container.maxWidth};
  margin: 0 auto;

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => `${theme.spacing.xxxl} ${theme.spacing.md}`};
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => `${theme.spacing.xxl} ${theme.spacing.md}`};
  }
`

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.xl};

  ${({ theme }) => theme.media.desktop} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${({ theme }) => theme.media.tablet} {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.lg};
  }
`

const CardWrapper = styled.div`
  transform-style: preserve-3d;
  will-change: transform;
`

const CardAccent = styled.div`
  position: absolute;
  left: 0;
  top: 10%;
  height: 80%;
  width: 3px;
  background: ${({ theme }) => theme.gradients.goldDivider};
  transform: ${({ $hovered }) => ($hovered ? 'scaleY(1)' : 'scaleY(0)')};
  transition: transform 0.3s ease;
  border-radius: 0 2px 2px 0;
  z-index: 2;
`

const ProjectCard = styled.a`
  position: relative;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ $hovered, theme }) => ($hovered ? theme.colors.borderGold : theme.glass.border)};
  border-radius: 14px;
  overflow: hidden;
  box-shadow: ${({ $hovered, theme }) =>
    $hovered
      ? `${theme.glass.shadowGold}, 0 20px 60px rgba(0,0,0,0.5)`
      : theme.glass.shadow};
  text-decoration: none;
  transition: border-color 0.35s ease, box-shadow 0.35s ease;
`

const CardImage = styled.div`
  position: relative;
  height: 230px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.primary};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  ${({ theme }) => theme.media.tablet} {
    height: 200px;
  }

  ${({ theme }) => theme.media.mobile} {
    height: 170px;
  }
`

const ImageOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: ${({ theme }) => theme.gradients.cardOverlay};
  pointer-events: none;
`

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, rgba(13,31,51,0.6) 100%);
`

const CardBadge = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  backdrop-filter: blur(8px);
`

const CardBody = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  flex: 1;

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.md};
  }
`

const CardLocation = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.eyebrow};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: ${({ theme }) => theme.colors.gold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const CardTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: 900;
  letter-spacing: -1px;
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: 0;

  ${({ theme }) => theme.media.mobile} {
    font-size: 1.25rem;
    letter-spacing: -0.5px;
  }
`

const CardDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.gradients.goldDivider};
  margin: ${({ theme }) => `${theme.spacing.sm} 0`};
  opacity: 0.4;
`

const CardDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.85;
  flex: 1;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.glass.border};
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`

const PriceTag = styled.div``

const PriceLabel = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`

const PriceValue = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 700;
  background: ${({ theme }) => theme.gradients.goldText};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const CardArrow = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ $hovered, theme }) =>
    $hovered ? theme.gradients.gold : 'rgba(214,179,112,0.1)'};
  border: 1px solid ${({ $hovered }) =>
    $hovered ? 'transparent' : 'rgba(214,179,112,0.2)'};
  color: ${({ $hovered, theme }) => ($hovered ? theme.colors.deepBg : theme.colors.gold)};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: ${({ $hovered }) =>
    $hovered ? '0 4px 12px rgba(214,179,112,0.4)' : 'none'};
`

const CarouselControls = styled.div`
  display: none;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};

  ${({ theme }) => theme.media.tablet} {
    display: flex;
  }
`

const CarouselBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.glass.border};
  color: ${({ theme }) => theme.colors.gold};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    background: rgba(214,179,112,0.1);
    border-color: ${({ theme }) => theme.colors.borderGold};
  }
`

const DotsRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

const Dot = styled.button`
  width: ${({ $active }) => ($active ? '20px' : '8px')};
  height: 8px;
  border-radius: 4px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.gold : 'rgba(255,255,255,0.2)'};
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
`

const CTAWrapper = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.xxl};
`

const ViewAllLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gold};
  text-decoration: none;
  transition: all ${({ theme }) => theme.transitions.fast};
  border-bottom: 1px solid rgba(214,179,112,0.3);
  padding-bottom: 3px;
  letter-spacing: 0.02em;

  &:hover {
    color: ${({ theme }) => theme.colors.goldLight};
    gap: ${({ theme }) => theme.spacing.md};
    border-bottom-color: rgba(214,179,112,0.6);
  }
`

const ErrorMsg = styled.p`
  text-align: center;
  color: #f87171;
  padding: ${({ theme }) => theme.spacing.xxl};
`

export default FeaturedProjects
