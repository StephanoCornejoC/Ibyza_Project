import { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import sectionBg from '@/assets/images/bg-mision-pexels.jpg'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Eye, Award } from 'lucide-react'

/**
 * MisionVisionCards — 3 cards interactivas con flip animation.
 * Front: icono + titulo. Back: texto completo.
 * Hover revela el contenido con transicion suave.
 */
const ITEMS = [
  {
    icon: Target,
    number: '01',
    label: 'Nuestra Mision',
    fallback:
      'Desarrollar proyectos inmobiliarios en areas consolidadas de Arequipa, generando mayor valor para nuestros clientes a traves de ubicaciones estrategicas, diseno funcional y acabados de calidad.',
    cmsKey: 'mision',
  },
  {
    icon: Eye,
    number: '02',
    label: 'Nuestra Vision',
    fallback:
      'Ser el referente local en desarrollo inmobiliario sostenible, reconocidos por la calidad de nuestros proyectos y el valor que generamos para inversionistas y familias.',
    cmsKey: 'vision',
  },
  {
    icon: Award,
    number: '03',
    label: 'Nuestro Compromiso',
    fallback:
      'Dedicamos especial atencion a escuchar a nuestros clientes y mejorar continuamente. Cada proyecto es construido con los mas altos estandares, garantizando que tu inversion sea segura.',
    cmsKey: 'propuesta_valor',
  },
]

const MisionVisionCards = ({ content }) => {
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
            <Eyebrow>— Nuestro Proposito —</Eyebrow>
            <Title>Construimos con proposito</Title>
            <GoldDivider />
          </motion.div>
        </HeaderBlock>

        <CardsGrid>
          {ITEMS.map((item, index) => (
            <FlipCard
              key={item.label}
              item={item}
              text={content?.[item.cmsKey] || item.fallback}
              index={index}
            />
          ))}
        </CardsGrid>
      </SectionInner>
    </Section>
  )
}

const FlipCard = ({ item, text, index }) => {
  const [flipped, setFlipped] = useState(false)
  const Icon = item.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
    >
      <CardContainer
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
        onClick={() => setFlipped(!flipped)}
      >
        <CardInner $flipped={flipped}>
          {/* Front */}
          <CardFront>
            <IconWrapper>
              <Icon size={32} />
            </IconWrapper>
            <CardLabel>{item.label}</CardLabel>
            <HintText>Toca para descubrir</HintText>
          </CardFront>

          {/* Back */}
          <CardBack>
            <BackLabel>{item.label}</BackLabel>
            <BackText>{text}</BackText>
          </CardBack>
        </CardInner>
      </CardContainer>
    </motion.div>
  )
}

// --- Animaciones ---

const breatheGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(214,179,112,0);
    border-color: rgba(255,255,255,0.06);
  }
  50% {
    box-shadow: 0 0 20px rgba(214,179,112,0.15), 0 0 40px rgba(214,179,112,0.05);
    border-color: rgba(214,179,112,0.2);
  }
`

const iconFloat = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`

const hintPulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
`

// --- Estilos ---

const Section = styled.section`
  padding: ${({ theme }) => `${theme.spacing.section} 0`};
  background-color: ${({ theme }) => theme.colors.deepBg};
  background-image: url(${sectionBg});
  background-size: cover;
  background-position: center;
  background-attachment: scroll;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(8,19,31,0.92);
    z-index: 0;
  }

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => `${theme.spacing.xxxl} 0`};
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => `${theme.spacing.xxl} 0`};
  }
`

const SectionInner = styled.div`
  position: relative;
  z-index: 1;
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

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  font-weight: 900;
  letter-spacing: -2px;
  color: ${({ theme }) => theme.colors.white};
  line-height: 1.05;

  ${({ theme }) => theme.media.tablet} {
    font-size: ${({ theme }) => theme.fontSizes['3xl']};
  }
`

const GoldDivider = styled.div`
  width: 80px;
  height: 1px;
  background: ${({ theme }) => theme.gradients.goldDivider};
  margin: ${({ theme }) => theme.spacing.md} auto 0;
  box-shadow: 0 0 10px rgba(214,179,112,0.3);
`

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.xl};

  ${({ theme }) => theme.media.desktop} {
    grid-template-columns: 1fr;
    max-width: 480px;
    margin: 0 auto;
  }

  ${({ theme }) => theme.media.mobile} {
    gap: ${({ theme }) => theme.spacing.md};
  }
`

const CardContainer = styled.div`
  perspective: 1000px;
  height: 320px;
  cursor: pointer;

  ${({ theme }) => theme.media.mobile} {
    height: 280px;
  }
`

const CardInner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-style: preserve-3d;
  transform: ${({ $flipped }) => ($flipped ? 'rotateY(180deg)' : 'rotateY(0)')};
`

const cardSide = `
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(1.25rem, 4vw, 2rem);
`

const CardFront = styled.div`
  ${cardSide}
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  text-align: center;
  animation: ${breatheGlow} 3s ease-in-out infinite;

  ${CardContainer}:hover & {
    animation: none;
    border-color: rgba(214,179,112,0.3);
    box-shadow: 0 0 25px rgba(214,179,112,0.2);
  }
`

const CardBack = styled.div`
  ${cardSide}
  background: linear-gradient(135deg, rgba(214,179,112,0.12) 0%, rgba(8,19,31,0.95) 100%);
  border: 1px solid rgba(214,179,112,0.3);
  transform: rotateY(180deg);
  text-align: center;
`

const CardNumber = styled.div`
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 3.5rem;
  font-weight: 900;
  color: ${({ $back }) => ($back ? 'rgba(214,179,112,0.1)' : 'rgba(255,255,255,0.04)')};
  line-height: 1;
  pointer-events: none;
`

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(214,179,112,0.1);
  border: 1px solid rgba(214,179,112,0.25);
  color: ${({ theme }) => theme.colors.gold};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  animation: ${iconFloat} 3s ease-in-out infinite;
  transition: all 0.3s ease;

  ${CardContainer}:hover & {
    animation: none;
    background: rgba(214,179,112,0.18);
    transform: scale(1.08);
    box-shadow: 0 0 20px rgba(214,179,112,0.2);
  }
`

const CardLabel = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: 900;
  letter-spacing: -1px;
  color: ${({ theme }) => theme.colors.gold};
  margin: 0;
`

const HintText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: ${({ theme }) => theme.spacing.md};
  text-transform: uppercase;
  letter-spacing: 2px;
  animation: ${hintPulse} 2.5s ease-in-out infinite;
`

const BackLabel = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 900;
  color: ${({ theme }) => theme.colors.gold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const BackText = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.8;
`

export default MisionVisionCards
