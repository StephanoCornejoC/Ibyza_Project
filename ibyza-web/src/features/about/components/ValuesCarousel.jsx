import { useState, useEffect, useRef, useCallback } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Star, Users, Zap, Heart, Award, ChevronLeft, ChevronRight } from 'lucide-react'

import valCompromiso from '@/assets/images/values-compromiso.png'
import valIntegridad from '@/assets/images/values-integridad.png'
import valInnovacion from '@/assets/images/values-innovacion.png'
import valSostenibilidad from '@/assets/images/values-sostenibilidad.png'
import valProfesionalismo from '@/assets/images/values-profesionalismo.png'
import valCalidad from '@/assets/images/values-calidad.png'

/**
 * ValuesCarousel — Carrusel de 6 valores con auto-play cada 4s.
 * Cards anchas con imagen de fondo opacada. Pausa SOLO al hover en la card.
 */
const VALUES = [
  {
    icon: Shield,
    title: 'Compromiso',
    description: 'Nos comprometemos con la satisfaccion total de nuestros clientes y el desarrollo de la comunidad.',
    image: valCompromiso,
  },
  {
    icon: Star,
    title: 'Integridad',
    description: 'Construimos relaciones duraderas basadas en la transparencia y la honestidad en cada decision.',
    image: valIntegridad,
  },
  {
    icon: Zap,
    title: 'Innovacion',
    description: 'Incorporamos las ultimas tendencias en diseno arquitectonico y tecnologias constructivas.',
    image: valInnovacion,
  },
  {
    icon: Heart,
    title: 'Sostenibilidad',
    description: 'Desarrollamos proyectos responsables con el medio ambiente y el entorno urbano.',
    image: valSostenibilidad,
  },
  {
    icon: Users,
    title: 'Profesionalismo',
    description: 'Un equipo altamente calificado que acompana cada etapa del proceso de inversion.',
    image: valProfesionalismo,
  },
  {
    icon: Award,
    title: 'Calidad',
    description: 'Cada proyecto es ejecutado con los mas altos estandares de construccion y acabados premium.',
    image: valCalidad,
  },
]

const ValuesCarousel = () => {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef(null)

  const startTimer = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      if (!paused) {
        setDirection(1)
        setCurrent((prev) => (prev + 1) % VALUES.length)
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
    setCurrent((c) => (c === 0 ? VALUES.length - 1 : c - 1))
    startTimer()
  }

  const next = () => {
    setDirection(1)
    setCurrent((c) => (c + 1) % VALUES.length)
    startTimer()
  }

  const item = VALUES[current]
  const Icon = item.icon

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
            <Subtitle>Los principios que guian cada decision que tomamos como empresa.</Subtitle>
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
                      <Icon size={32} />
                    </IconWrapper>
                    <ValueTitle>{item.title}</ValueTitle>
                    <ValueDesc>{item.description}</ValueDesc>
                    <Counter>{current + 1} / {VALUES.length}</Counter>
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
          {VALUES.map((_, i) => (
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
