import { useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { ArrowRight, Building2, ChevronLeft, ChevronRight } from 'lucide-react'
import { SectionTitle } from '@/shared/components/ui/SectionTitle'
import { Badge } from '@/shared/components/ui/Badge'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Button } from '@/shared/components/ui/Button'
import { buildProjectDetailRoute, ROUTES } from '@/shared/constants/routes'
import { formatPriceUSD } from '@/shared/utils/formatters'
import { Spinner } from '@/shared/components/ui/Spinner'
import useMediaQuery from '@/shared/hooks/useMediaQuery'

/**
 * ProjectsCarousel — Marquee horizontal infinito con flechas overlay.
 *
 * Implementacion:
 *  - El array de proyectos se triplica para soportar loop seamless.
 *  - Un loop de requestAnimationFrame avanza el scrollLeft del track de
 *    forma continua. Cuando el scroll cruza el limite del segundo tercio,
 *    se rebobina al primer tercio (mismo offset visual): asi se obtiene
 *    el efecto marquee infinito sin saltos visibles.
 *  - El hover NO pausa el avance: la animacion sigue continuando para
 *    no parecer reiniciarse al pasar el mouse.
 *  - Las flechas estan en posicion absoluta dentro del CarouselArea
 *    (overlay con z-index alto) y, al hacer click, hacen scrollBy de un
 *    card-width + gap. Pausan el avance momentaneamente para no
 *    "competir" con el scroll smooth.
 *  - El padding lateral del Viewport reserva espacio para que las flechas
 *    no tapen las cards.
 *  - Cards con ancho fijo escalando por viewport (~2.5 mobile,
 *    ~3.5 laptop comun, ~4.5 desktop ancho, 5+ extra grande).
 *  - En mobile (<480px) las flechas se ocultan: el usuario hace swipe
 *    nativo y el espacio horizontal se conserva para mostrar mas card.
 */
const SPEED_PX_PER_SEC = 35 // velocidad del marquee
const RESUME_DELAY_MS = 1200 // tras un click de flecha, esperamos antes de retomar el avance auto

const ProjectsCarousel = ({ projects, loading }) => {
  const trackRef = useRef(null)
  const rafIdRef = useRef(null)
  const lastTsRef = useRef(0)
  const pausedRef = useRef(false)
  const resumeTimerRef = useRef(null)
  const isMobile = useMediaQuery('(max-width: 480px)')
  // En touch devices (mobile/tablet) dejamos que el scroll nativo + scroll-snap
  // manejen el carrusel. El rAF de marquee compite con el touch del usuario y
  // congela la card cuando el dedo esta apoyado. Se desactiva el avance auto.
  const isCoarsePointer = useMediaQuery('(pointer: coarse)')

  // Triplicamos el array SOLO en desktop para que el loop sea seamless.
  // En touch usamos el array tal cual: el usuario hace swipe especifico,
  // no quiere ver los mismos proyectos repetidos 3 veces.
  const tripled = projects && projects.length
    ? (isCoarsePointer ? [...projects] : [...projects, ...projects, ...projects])
    : []

  const getStep = useCallback(() => {
    const track = trackRef.current
    if (!track) return 0
    const card = track.querySelector('[data-card]')
    if (!card) return 0
    const cardWidth = card.getBoundingClientRect().width
    const styles = window.getComputedStyle(track)
    const gap = parseFloat(styles.columnGap || styles.gap || '20') || 20
    return cardWidth + gap
  }, [])

  const goPrev = () => {
    const track = trackRef.current
    if (!track) return
    pausedRef.current = true
    track.scrollBy({ left: -getStep(), behavior: 'smooth' })
    schedulePauseRelease()
  }

  const goNext = () => {
    const track = trackRef.current
    if (!track) return
    pausedRef.current = true
    track.scrollBy({ left: getStep(), behavior: 'smooth' })
    schedulePauseRelease()
  }

  const schedulePauseRelease = () => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false
    }, RESUME_DELAY_MS)
  }

  // Loop de marquee + wrap-around para que el scroll siga siempre dentro
  // del segundo tercio "visible". Esto da el efecto infinito.
  // En touch devices NO arrancamos el rAF: el usuario hace swipe nativo y
  // el scroll-snap del CSS se encarga del UX.
  useEffect(() => {
    if (isCoarsePointer) return undefined
    const track = trackRef.current
    if (!track || !projects || projects.length === 0) return undefined

    const positionMiddle = () => {
      const max = track.scrollWidth
      const third = max / 3
      if (third > 0) track.scrollLeft = third
    }
    positionMiddle()

    const tick = (ts) => {
      const last = lastTsRef.current || ts
      const dt = (ts - last) / 1000
      lastTsRef.current = ts

      const shouldAdvance = !pausedRef.current
      if (shouldAdvance) {
        track.scrollLeft += SPEED_PX_PER_SEC * dt
      }

      // Wrap-around silencioso para mantener el efecto loop.
      const max = track.scrollWidth
      const third = max / 3
      if (third > 0) {
        if (track.scrollLeft >= third * 2) {
          track.scrollLeft = track.scrollLeft - third
        } else if (track.scrollLeft <= 0) {
          track.scrollLeft = third
        }
      }

      rafIdRef.current = requestAnimationFrame(tick)
    }

    rafIdRef.current = requestAnimationFrame(tick)

    window.addEventListener('resize', positionMiddle)

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
      window.removeEventListener('resize', positionMiddle)
    }
  }, [projects, isCoarsePointer])

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

      <CarouselArea>
        {!isMobile && (
          <NavBtn $side="left" onClick={goPrev} aria-label="Proyecto anterior">
            <ChevronLeft size={22} />
          </NavBtn>
        )}

        <Viewport>
          <Track ref={trackRef}>
            {tripled.map((project, idx) => (
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
        </Viewport>

        {!isMobile && (
          <NavBtn $side="right" onClick={goNext} aria-label="Siguiente proyecto">
            <ChevronRight size={22} />
          </NavBtn>
        )}
      </CarouselArea>

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

const CarouselArea = styled.div`
  position: relative;
  max-width: ${({ theme }) => theme.container.maxWidth};
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.xl} 0`};

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => `${theme.spacing.lg} 0`};
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => `${theme.spacing.md} 0`};
  }
`

const NavBtn = styled.button`
  position: absolute;
  top: 50%;
  ${({ $side }) => ($side === 'left' ? 'left: 8px;' : 'right: 8px;')}
  transform: translateY(-50%);
  z-index: 5;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.glass.border};
  color: ${({ theme }) => theme.colors.gold};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.35);

  &:hover {
    background: rgba(214,179,112,0.18);
    border-color: ${({ theme }) => theme.colors.borderGold};
    transform: translateY(-50%) scale(1.05);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.gold};
    outline-offset: 2px;
  }
`

const Viewport = styled.div`
  // Padding lateral para que las flechas no tapen las cards.
  padding: 0 60px;
  overflow: hidden;
  position: relative;
  min-height: 1px;

  ${({ theme }) => theme.media.tablet} {
    padding: 0 56px;
  }

  ${({ theme }) => theme.media.mobile} {
    padding: 0 ${({ theme }) => theme.spacing.md};
  }
`

const Track = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 20px;
  overflow-x: auto;

  // Ocultar la barra de scroll nativa (mantenemos la funcionalidad).
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }

  // En touch devices (mobile/tablet) usamos scroll-snap nativo + momentum
  // de iOS. El JS marquee no corre en estos dispositivos, asi que el swipe
  // del usuario manda. Desktop con mouse mantiene el marquee continuo.
  @media (pointer: coarse) {
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scroll-padding-left: ${({ theme }) => theme.spacing.md};
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
