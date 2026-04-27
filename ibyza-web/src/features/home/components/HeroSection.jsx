import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { ROUTES } from '@/shared/constants/routes'
import { fadeInUp, scaleIn, staggerContainer } from '@/shared/utils/animations'

/**
 * HeroSection — Hero premium exacto 100vh.
 * - Logo IBYZA centrado con shimmer
 * - Slogan como texto body (no heading)
 * - Imagen de fondo dinamica desde CMS
 * - Sin scroll indicator, sin KPIs
 */
import heroFallback from '@/assets/images/hero-home-pexels.jpg'
const HERO_FALLBACK = heroFallback

const HeroSection = ({ content }) => {
  const slogan =
    content?.titulo ||
    'Tu mejor inversion al mejor precio y en la mejor ubicacion'
  const imagenFondo = content?.imagen_fondo || HERO_FALLBACK

  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let width = (canvas.width = canvas.offsetWidth)
    let height = (canvas.height = canvas.offsetHeight)

    particlesRef.current = Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      alphaSpeed: (Math.random() * 0.005) + 0.001,
      alphaDir: 1,
    }))

    const animate = () => {
      ctx.clearRect(0, 0, width, height)
      particlesRef.current.forEach((p) => {
        p.x += p.speedX
        p.y += p.speedY
        p.alpha += p.alphaSpeed * p.alphaDir
        if (p.alpha >= 0.6 || p.alpha <= 0.05) p.alphaDir *= -1
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = '#D6B370'
        ctx.shadowColor = '#D6B370'
        ctx.shadowBlur = 6
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    const onResize = () => {
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
    }
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <HeroWrapper $bgImage={imagenFondo}>
      <ParticlesCanvas ref={canvasRef} aria-hidden="true" />
      <HeroOverlay $hasBg={!!imagenFondo} />
      {!imagenFondo && <GridPattern />}
      <GoldGlow />

      <HeroContent
        as={motion.div}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Logo IBYZA */}
        <motion.div variants={fadeInUp}>
          <LogoMain>IBYZA</LogoMain>
          <LogoTagline>Ingenieria y Construccion</LogoTagline>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 1 }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ duration: 0.9, delay: 0.7, ease: [0.77, 0, 0.18, 1] }}
        >
          <HeroDivider />
        </motion.div>

        {/* Slogan como texto body */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.85, ease: 'easeOut' }}
        >
          <HeroSlogan>{slogan}</HeroSlogan>
        </motion.div>

        {/* CTAs */}
        <motion.div variants={scaleIn} transition={{ delay: 1.05 }}>
          <HeroCTAs>
            <PrimaryButton as={Link} to={ROUTES.PROJECTS}>
              Ver proyectos
              <ArrowRight size={18} />
            </PrimaryButton>
            <SecondaryButton as={Link} to={ROUTES.CONTACT}>
              Contactar asesor
            </SecondaryButton>
          </HeroCTAs>
        </motion.div>
      </HeroContent>

      {/* Linea dorada inferior */}
      <motion.div
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        animate={{ clipPath: 'inset(0 0% 0 0)' }}
        transition={{ duration: 1.2, delay: 1.3, ease: [0.77, 0, 0.18, 1] }}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2 }}
      >
        <BottomLine />
      </motion.div>
    </HeroWrapper>
  )
}

// --- Estilos ---

const HeroWrapper = styled.section`
  position: relative;
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.deepBg};
  background-image: ${({ $bgImage }) => ($bgImage ? `url(${$bgImage})` : 'none')};
  background-size: cover;
  background-position: center;
  overflow: hidden;
`

const ParticlesCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
`

const HeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: ${({ $hasBg, theme }) =>
    $hasBg
      ? `linear-gradient(180deg, rgba(8,19,31,0.7) 0%, rgba(8,19,31,0.5) 50%, rgba(8,19,31,0.8) 100%)`
      : `radial-gradient(ellipse at 65% 40%, rgba(214,179,112,0.06) 0%, transparent 55%),
         linear-gradient(180deg, ${theme.colors.deepBg} 0%, ${theme.colors.primary} 50%, ${theme.colors.deepBg} 100%)`};
  z-index: 1;
`

const GridPattern = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  z-index: 1;
  pointer-events: none;
`

const GoldGlow = styled.div`
  position: absolute;
  top: 20%;
  right: 10%;
  width: clamp(260px, 50vw, 500px);
  height: clamp(260px, 50vw, 500px);
  background: radial-gradient(circle, rgba(214,179,112,0.05) 0%, transparent 65%);
  pointer-events: none;
  z-index: 1;

  ${({ theme }) => theme.media.mobile} {
    top: 10%;
    right: 0;
  }
`

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 900px;
  padding: ${({ theme }) => `0 ${theme.spacing.lg}`};
  margin: 0 auto;
  width: 100%;

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => `0 ${theme.spacing.md}`};
  }
`

const shimmerLogo = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`

const LogoMain = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 7rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  line-height: 1;
  background: linear-gradient(
    90deg,
    #8B6914 0%,
    #D6B370 20%,
    #FFE499 50%,
    #D6B370 80%,
    #8B6914 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${shimmerLogo} 4s linear infinite;
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  ${({ theme }) => theme.media.tablet} {
    font-size: 4.5rem;
    letter-spacing: 0.15em;
  }

  ${({ theme }) => theme.media.mobile} {
    font-size: 3rem;
    letter-spacing: 0.1em;
  }
`

const LogoTagline = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.eyebrow};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 6px;
  color: ${({ theme }) => theme.colors.gold};
  opacity: 0.7;
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  ${({ theme }) => theme.media.mobile} {
    letter-spacing: 3px;
    font-size: 0.65rem;
  }
`

const HeroDivider = styled.div`
  width: 48px;
  height: 3px;
  background: ${({ theme }) => theme.gradients.goldDivider};
  margin: ${({ theme }) => `${theme.spacing.lg} auto`};
  box-shadow: 0 0 12px rgba(214,179,112,0.5);
`

const HeroSlogan = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 300;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 580px;
  margin: 0 auto ${({ theme }) => theme.spacing.xxl};
  line-height: 1.85;

  ${({ theme }) => theme.media.tablet} {
    font-size: ${({ theme }) => theme.fontSizes.md};
  }

  ${({ theme }) => theme.media.mobile} {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    line-height: 1.7;
    margin-bottom: ${({ theme }) => theme.spacing.xl};
  }
`

const HeroCTAs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  justify-content: center;
  flex-wrap: wrap;

  ${({ theme }) => theme.media.mobile} {
    gap: ${({ theme }) => theme.spacing.sm};
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    max-width: 320px;
    margin: 0 auto;
  }
`

const PrimaryButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.gradients.gold};
  color: ${({ theme }) => theme.colors.deepBg};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.md};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xxl}`};
  border-radius: ${({ theme }) => theme.radii.md};
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 20px rgba(214,179,112,0.4);
  white-space: nowrap;

  &:hover {
    box-shadow: 0 8px 32px rgba(214,179,112,0.55);
    transform: translateY(-3px);
    background: linear-gradient(135deg, #E7AA51 0%, #FFE499 50%, #D6B370 100%);
  }

  svg {
    transition: transform 0.15s ease;
  }
  &:hover svg {
    transform: translateX(4px);
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    width: 100%;
  }
`

const SecondaryButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: rgba(255,255,255,0.85);
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.md};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xxl}`};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid ${({ theme }) => theme.glass.border};
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  white-space: nowrap;

  &:hover {
    border-color: rgba(214,179,112,0.4);
    color: ${({ theme }) => theme.colors.gold};
    background: rgba(214,179,112,0.08);
    transform: translateY(-3px);
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    width: 100%;
  }
`

const BottomLine = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.gradients.goldDivider};
  opacity: 0.6;
`

export default HeroSection
