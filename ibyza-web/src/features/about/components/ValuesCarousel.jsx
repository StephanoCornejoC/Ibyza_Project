import { useState, useEffect, useRef, useCallback, useMemo, createElement } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import api from '@/shared/services/api'
import { resolveValueIcon, DEFAULT_VALUE_ICON } from '@/shared/constants/valueIcons'

import valCompromiso from '@/assets/images/values-compromiso.webp'
import valIntegridad from '@/assets/images/values-integridad.webp'
import valInnovacion from '@/assets/images/values-innovacion.webp'
import valSostenibilidad from '@/assets/images/values-sostenibilidad.webp'
import valProfesionalismo from '@/assets/images/values-profesionalismo.webp'
import valCalidad from '@/assets/images/values-calidad.webp'

/**
 * ValuesCarousel — Carrusel de valores con auto-play cada 4s.
 * Los valores vienen del CMS (modelo Beneficio, endpoint GET /api/beneficios/).
 * Si el fetch falla o tarda, usa los 6 valores fallback hardcoded para no
 * dejar la pagina vacia.
 *
 * El icono se mapea por nombre contra el catalogo curado de valueIcons.js.
 * Si el CMS manda un nombre fuera de esa lista, cae al icono por defecto.
 */
const FALLBACK_VALUES = [
  { id: 'f-1', title: 'Compromiso',     description: 'Nos comprometemos con la satisfacción total de nuestros clientes y el desarrollo de la comunidad.',  image: valCompromiso,     icon: 'Shield' },
  { id: 'f-2', title: 'Integridad',     description: 'Construimos relaciones duraderas basadas en la transparencia y la honestidad en cada decisión.',     image: valIntegridad,     icon: 'Star' },
  { id: 'f-3', title: 'Innovación',     description: 'Incorporamos las últimas tendencias en diseño arquitectónico y tecnologías constructivas.',           image: valInnovacion,     icon: 'Zap' },
  { id: 'f-4', title: 'Sostenibilidad', description: 'Desarrollamos proyectos responsables con el medio ambiente y el entorno urbano.',                     image: valSostenibilidad, icon: 'Heart' },
  { id: 'f-5', title: 'Profesionalismo',description: 'Un equipo altamente calificado que acompaña cada etapa del proceso de inversión.',                    image: valProfesionalismo,icon: 'Users' },
  { id: 'f-6', title: 'Calidad',        description: 'Cada proyecto es ejecutado con los más altos estándares de construcción y acabados premium.',         image: valCalidad,        icon: 'Award' },
]

const ValuesCarousel = () => {
  const [values, setValues] = useState(FALLBACK_VALUES)
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef(null)

  // Fetch del CMS — si falla, los fallback ya estan cargados.
  useEffect(() => {
    let mounted = true
    api.get('/api/beneficios/')
      .then((res) => {
        if (!mounted) return
        const items = res.data?.results || res.data || []
        if (Array.isArray(items) && items.length > 0) {
          setValues(items.map((b) => ({
            id: b.id,
            title: b.titulo,
            description: b.descripcion,
            image: b.imagen || null,
            icon: b.icono || DEFAULT_VALUE_ICON,
          })))
        }
      })
      .catch(() => {
        // Mantener fallback silenciosamente.
      })
    return () => { mounted = false }
  }, [])

  const startTimer = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      if (!paused) {
        setDirection(1)
        setCurrent((prev) => (prev + 1) % values.length)
      }
    }, 4000)
  }, [paused])

  useEffect(() => {
    startTimer()
    return () => clearInterval(intervalRef.current)
  }, [startTimer])

  const goTo = (idx) => {
    setDirection(idx > current ? 1 : -1)
    setCurrent(idx)
    startTimer()
  }

  const prev = () => {
    setDirection(-1)
    setCurrent((c) => (c === 0 ? values.length - 1 : c - 1))
    startTimer()
  }

  const next = () => {
    setDirection(1)
    setCurrent((c) => (c + 1) % values.length)
    startTimer()
  }

  const item = values[current] || values[0]
  // El backend manda el nombre del icono Lucide como string. Se resuelve contra
  // el catalogo curado de @/shared/constants/valueIcons; si el nombre no esta en
  // la lista, resolveValueIcon devuelve el icono por defecto.
  // Se usa createElement en vez de <Icon /> a proposito: resolveValueIcon no crea
  // un componente nuevo, solo elige una referencia estable del catalogo. Con la
  // forma <Icon /> el analizador de react-hooks lo interpreta como creacion de
  // componente en render (falso positivo) y marca static-components.
  const iconElement = useMemo(
    () => createElement(resolveValueIcon(item.icon), { size: 32 }),
    [item.icon],
  )

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  }

  return (
    <Section>
      <SectionInner>
        <HeaderBlock>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Eyebrow>— Nuestros Valores —</Eyebrow>
            <STitle>Lo que nos define</STitle>
            <GoldDivider />
            <Subtitle>Los principios que guían cada decisión que tomamos como empresa.</Subtitle>
          </motion.div>
        </HeaderBlock>

        <CarouselArea>
          <NavBtn onClick={prev} aria-label="Valor anterior">
            <ChevronLeft size={20} />
          </NavBtn>

          <CardViewport>
            <AnimatePresence custom={direction} mode="wait">
              <CardMotion
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <ValueCard
                  $bgImage={item.image}
                  onMouseEnter={() => setPaused(true)}
                  onMouseLeave={() => setPaused(false)}
                >
                  <CardOverlay />
                  <CardContent>
                    <IconWrapper>
                      {iconElement}
                    </IconWrapper>
                    <ValueTitle>{item.title}</ValueTitle>
                    <ValueDesc>{item.description}</ValueDesc>
                    <Counter>{current + 1} / {values.length}</Counter>
                  </CardContent>
                </ValueCard>
              </CardMotion>
            </AnimatePresence>
          </CardViewport>

          <NavBtn onClick={next} aria-label="Siguiente valor">
            <ChevronRight size={20} />
          </NavBtn>
        </CarouselArea>

        <DotsRow>
          {values.map((_, i) => (
            <Dot key={i} $active={i === current} onClick={() => goTo(i)} />
          ))}
        </DotsRow>
      </SectionInner>
    </Section>
  )
}

const Section = styled.section`
  padding: ${({ theme }) => `${theme.spacing.section} 0`};
  background: ${({ theme }) => theme.gradients.section};

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => `${theme.spacing.xxxl} 0`};
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => `${theme.spacing.xxl} 0`};
  }
`

const SectionInner = styled.div`
  max-width: ${({ theme }) => theme.container.maxWidth};
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.lg};

  ${({ theme }) => theme.media.mobile} {
    padding: 0 ${({ theme }) => theme.spacing.md};
  }
`

const HeaderBlock = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`

const Eyebrow = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.eyebrow};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: ${({ theme }) => theme.colors.gold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const STitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  font-weight: 900;
  letter-spacing: -2px;
  color: ${({ theme }) => theme.colors.white};

  ${({ theme }) => theme.media.tablet} {
    font-size: ${({ theme }) => theme.fontSizes['3xl']};
  }
`

const GoldDivider = styled.div`
  width: 80px;
  height: 1px;
  background: ${({ theme }) => theme.gradients.goldDivider};
  margin: ${({ theme }) => theme.spacing.md} auto;
  box-shadow: 0 0 10px rgba(214,179,112,0.3);
`

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 500px;
  margin: ${({ theme }) => theme.spacing.md} auto 0;
  line-height: 1.8;
`

const CarouselArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg};

  ${({ theme }) => theme.media.mobile} {
    gap: ${({ theme }) => theme.spacing.sm};
  }
`

const NavBtn = styled.button`
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
  transition: all 0.25s ease;
  flex-shrink: 0;

  &:hover {
    background: rgba(214,179,112,0.1);
    border-color: ${({ theme }) => theme.colors.borderGold};
  }

  ${({ theme }) => theme.media.mobile} {
    width: 36px;
    height: 36px;
  }
`

const CardViewport = styled.div`
  width: 100%;
  max-width: 750px;
  min-height: 340px;
  position: relative;
  overflow: hidden;

  ${({ theme }) => theme.media.mobile} {
    min-height: 300px;
  }
`

const CardMotion = styled(motion.div)`
  width: 100%;
`

const ValueCard = styled.div`
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
  background-image: ${({ $bgImage }) => $bgImage ? `url(${$bgImage})` : 'none'};
  background-size: cover;
  background-position: center;
  border: 1px solid rgba(214,179,112,0.35);
  transition: border-color 0.3s ease, transform 0.3s ease;
  cursor: default;

  &:hover {
    border-color: ${({ theme }) => theme.colors.gold};
    transform: scale(1.02);
  }

  ${({ theme }) => theme.media.mobile} {
    min-height: 280px;
  }
`

const CardOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(13,31,51,0.8) 0%, rgba(8,19,31,0.92) 100%);
  z-index: 0;
`

const CardContent = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => theme.spacing.xl};
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`

const IconWrapper = styled.div`
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: rgba(214,179,112,0.1);
  border: 1px solid rgba(214,179,112,0.25);
  color: ${({ theme }) => theme.colors.gold};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${({ theme }) => theme.spacing.lg};

  ${({ theme }) => theme.media.mobile} {
    width: 56px;
    height: 56px;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`

const ValueTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: 900;
  letter-spacing: -1px;
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  ${({ theme }) => theme.media.mobile} {
    font-size: 1.4rem;
  }
`

const ValueDesc = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.85;
  max-width: 480px;
  margin: 0 auto;

  ${({ theme }) => theme.media.mobile} {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    line-height: 1.7;
  }
`

const Counter = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: ${({ theme }) => theme.spacing.lg};
  letter-spacing: 2px;
  text-transform: uppercase;
`

const DotsRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: ${({ theme }) => theme.spacing.xl};
`

const Dot = styled.button`
  width: ${({ $active }) => ($active ? '24px' : '8px')};
  height: 8px;
  border-radius: 4px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.gold : 'rgba(255,255,255,0.15)'};
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
`

export default ValuesCarousel
