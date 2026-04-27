import styled from 'styled-components'
import { motion } from 'framer-motion'
import { useCountUp } from '@/shared/hooks/useCountUp'
import { staggerContainer, fadeInUp } from '@/shared/utils/animations'

/**
 * AboutHero — Hero 100vh de la pagina Nosotros.
 * Stats integrados dentro del hero (sin seccion vacia debajo).
 * Imagen de fondo dinamica desde CMS.
 */
import heroFallback from '@/assets/images/hero-about-pexels.jpg'
const HERO_FALLBACK = heroFallback

const AboutHero = ({ content }) => {
  const titulo = content?.titulo || 'Quienes somos'
  const subtitulo =
    content?.subtitulo ||
    'Una empresa comprometida con la calidad, la transparencia y el bienestar de nuestros clientes.'
  const bgImage = content?.imagen_hero || HERO_FALLBACK

  const words = titulo.split(' ')

  // Stats editables desde Django CMS (seccion: nosotros, claves: stat_anos, stat_vendidas, etc.)
  const stats = [
    { value: parseInt(content?.stat_anos) || 6, suffix: '+', label: 'Anos en el mercado' },
    { value: parseInt(content?.stat_vendidas) || 195, suffix: '+', label: 'Propiedades vendidas' },
    { value: parseInt(content?.stat_proyectos) || 6, suffix: '', label: 'Proyectos desarrollados' },
    { value: parseInt(content?.stat_entregadas) || 50, suffix: '+', label: 'Propiedades entregadas' },
  ]

  return (
    <HeroSection $bgImage={bgImage}>
      <Overlay />
      <GridPattern />
      <GoldGlow />

      <HeroContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <HeroEyebrow>— Conoce IBYZA —</HeroEyebrow>
        </motion.div>

        <TitleWrapper aria-label={titulo}>
          {words.map((word, i) => (
            <WordOuter key={`${word}-${i}`}>
              <motion.span
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: 0.15 + i * 0.09,
                  duration: 0.75,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                style={{ display: 'inline-block' }}
                aria-hidden="true"
              >
                {word}
              </motion.span>
              {i < words.length - 1 && <span aria-hidden="true">&nbsp;</span>}
            </WordOuter>
          ))}
        </TitleWrapper>

        <motion.div
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.77, 0, 0.18, 1] }}
        >
          <HeroDivider />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
        >
          <HeroSubtitle>{subtitulo}</HeroSubtitle>
        </motion.div>
      </HeroContent>

      {/* Stats integrados en la parte inferior del hero */}
      <StatsBar
        as={motion.div}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {stats.map((stat) => (
          <StatCardAnimated key={stat.label} {...stat} />
        ))}
      </StatsBar>

      <BottomLine />
    </HeroSection>
  )
}

const StatCardAnimated = ({ value, suffix, label }) => {
  const { ref, count } = useCountUp(value, 2000)
  return (
    <motion.div variants={fadeInUp}>
      <StatCard ref={ref}>
        <StatValue>{count}{suffix}</StatValue>
        <StatLabel>{label}</StatLabel>
      </StatCard>
    </motion.div>
  )
}

const HeroSection = styled.section`
  position: relative;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.deepBg};
  background-image: ${({ $bgImage }) => ($bgImage ? `url(${$bgImage})` : 'none')};
  background-size: cover;
  background-position: center;
  overflow: hidden;
`

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(8,19,31,0.85) 0%, rgba(8,19,31,0.7) 50%, rgba(8,19,31,0.9) 100%);
  z-index: 0;
`

const GridPattern = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
  z-index: 0;
`

const GoldGlow = styled.div`
  position: absolute;
  top: 10%;
  right: 10%;
  width: clamp(260px, 50vw, 500px);
  height: clamp(260px, 50vw, 500px);
  background: radial-gradient(circle, rgba(214,179,112,0.04) 0%, transparent 65%);
  pointer-events: none;
  z-index: 0;

  ${({ theme }) => theme.media.mobile} {
    top: 5%;
    right: 0;
  }
`

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: ${({ theme }) => theme.container.maxWidth};
  margin: 0 auto;
  padding: ${({ theme }) => `0 ${theme.spacing.lg}`};
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => `0 ${theme.spacing.md}`};
  }
`

const HeroEyebrow = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.eyebrow};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: ${({ theme }) => theme.colors.gold};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const TitleWrapper = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['5xl']};
  font-weight: 900;
  letter-spacing: -3px;
  line-height: 1;
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  ${({ theme }) => theme.media.tablet} {
    font-size: 3rem;
    letter-spacing: -2px;
  }

  ${({ theme }) => theme.media.mobile} {
    font-size: 2.2rem;
    letter-spacing: -1px;
  }
`

const WordOuter = styled.span`
  overflow: hidden;
  display: inline-flex;
`

const HeroDivider = styled.div`
  width: 48px;
  height: 3px;
  background: ${({ theme }) => theme.gradients.goldDivider};
  margin: ${({ theme }) => `${theme.spacing.lg} auto`};
  box-shadow: 0 0 12px rgba(214,179,112,0.5);
`

const HeroSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 300;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.85;

  ${({ theme }) => theme.media.tablet} {
    font-size: ${({ theme }) => theme.fontSizes.md};
  }

  ${({ theme }) => theme.media.mobile} {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    line-height: 1.7;
  }
`

const StatsBar = styled.div`
  position: relative;
  z-index: 1;
  max-width: ${({ theme }) => theme.container.maxWidth};
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.lg} ${theme.spacing.xxl}`};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
  border-top: 1px solid ${({ theme }) => theme.glass.border};
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    gap: ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.md} ${theme.spacing.xl}`};
  }

  ${({ theme }) => theme.media.mobile} {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`

const StatCard = styled.div`
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.glass.border};
  border-radius: 14px;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
  text-align: center;
  min-width: 120px;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: default;

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderGold};
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.glass.shadowGold};
  }

  ${({ theme }) => theme.media.tablet} {
    min-width: 100px;
    padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  }

  ${({ theme }) => theme.media.mobile} {
    min-width: 0;
    width: 100%;
    padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.xs}`};
  }
`

const StatValue = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: 900;
  letter-spacing: -1px;
  background: ${({ theme }) => theme.gradients.goldText};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;

  ${({ theme }) => theme.media.mobile} {
    font-size: 1.5rem;
  }
`

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 4px;
  letter-spacing: 0.04em;
  font-weight: 300;

  ${({ theme }) => theme.media.mobile} {
    font-size: 0.65rem;
    line-height: 1.3;
  }
`

const BottomLine = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: ${({ theme }) => theme.gradients.goldDivider};
  opacity: 0.5;
  z-index: 1;
`

export default AboutHero
