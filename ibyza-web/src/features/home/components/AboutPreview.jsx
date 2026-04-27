import styled from 'styled-components'
import { motion } from 'framer-motion'
import { ShieldCheck, Lightbulb, Award, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'

/**
 * AboutPreview — Seccion "Quienes Somos" en Home.
 * Layout 2 columnas: texto izq + valores grid (1 arriba, 2 abajo) der.
 * Imagen de fondo dinamica desde CMS.
 * Valores alineados a la empresa: Compromiso, Integridad, Innovacion.
 */
const VALUES = [
  { icon: ShieldCheck, label: 'Compromiso' },
  { icon: Lightbulb, label: 'Innovacion' },
  { icon: Award, label: 'Integridad' },
]

const AboutPreview = ({ content }) => {
  const descripcion =
    content?.historia ||
    'Somos una empresa de servicios generales que cuenta con profesionales altamente calificados y comprometidos con nuestros clientes a fin de lograr resultados optimos.'
  const bgImage = content?.imagen_nosotros || null

  return (
    <Section id="about-section" $bgImage={bgImage}>
      <BgOverlay />
      <ContentGrid>
        {/* Columna izquierda: texto */}
        <LeftColumn>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Eyebrow>— Nuestra Empresa —</Eyebrow>
            <Title>
              <TitleLine>Quienes</TitleLine>
              <TitleLine>Somos?</TitleLine>
            </Title>
            <Divider />
            <Description>{descripcion}</Description>
            <PrimaryButton as={Link} to={ROUTES.ABOUT}>
              Conocenos Mas
              <ArrowRight size={18} />
            </PrimaryButton>
          </motion.div>
        </LeftColumn>

        {/* Columna derecha: valores en grid 1 arriba + 2 abajo */}
        <RightColumn>
          {VALUES.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <ValueCard>
                  <ValueIconWrapper>
                    <Icon size={22} />
                  </ValueIconWrapper>
                  <ValueLabel>{item.label}</ValueLabel>
                </ValueCard>
              </motion.div>
            )
          })}
        </RightColumn>
      </ContentGrid>
    </Section>
  )
}

// --- Estilos ---

const Section = styled.section`
  position: relative;
  padding: ${({ theme }) => `${theme.spacing.section} 0`};
  background: ${({ theme }) => theme.colors.deepBg};
  min-height: 500px;
  display: flex;
  align-items: center;
  overflow: hidden;
`

const BgOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 30% 50%, rgba(214,179,112,0.03) 0%, transparent 60%);
  z-index: 0;
  pointer-events: none;
`

const ContentGrid = styled.div`
  position: relative;
  z-index: 1;
  max-width: ${({ theme }) => theme.container.maxWidth};
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.xxl} ${theme.spacing.lg}`};
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xxl};
  align-items: center;

  ${({ theme }) => theme.media.tablet} {
    grid-template-columns: 1fr;
    text-align: center;
    gap: ${({ theme }) => theme.spacing.xl};
    padding: ${({ theme }) => `${theme.spacing.xxl} ${theme.spacing.md}`};
  }
`

const LeftColumn = styled.div``

const Eyebrow = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.eyebrow};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: ${({ theme }) => theme.colors.gold};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  margin-bottom: 0;
`

const TitleLine = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  font-weight: 900;
  letter-spacing: -2px;
  color: ${({ theme }) => theme.colors.white};
  line-height: 1.05;

  ${({ theme }) => theme.media.tablet} {
    font-size: ${({ theme }) => theme.fontSizes['3xl']};
  }
`

const Divider = styled.div`
  width: 40px;
  height: 3px;
  background: ${({ theme }) => theme.colors.gold};
  margin: ${({ theme }) => `${theme.spacing.lg} 0`};
  border-radius: 2px;

  ${({ theme }) => theme.media.tablet} {
    margin: ${({ theme }) => `${theme.spacing.lg} auto`};
  }
`

const Description = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.85;
  max-width: 480px;
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  ${({ theme }) => theme.media.tablet} {
    max-width: 100%;
    margin: 0 auto ${({ theme }) => theme.spacing.xl};
  }
`

/* Boton consistente con el Hero "Ver proyectos" */
const PrimaryButton = styled.a`
  display: inline-flex;
  align-items: center;
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
`

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};

  ${({ theme }) => theme.media.tablet} {
    max-width: 500px;
    margin: 0 auto;
  }
`

const ValueCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.xl}`};
  transition: all 0.3s ease;
  width: 100%;

  &:hover {
    background: rgba(255,255,255,0.1);
    border-color: rgba(214,179,112,0.25);
    transform: translateY(-4px);
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.md};
    gap: ${({ theme }) => theme.spacing.md};
    justify-content: center;
  }
`

const ValueIconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: rgba(214,179,112,0.12);
  border: 1px solid rgba(214,179,112,0.25);
  color: ${({ theme }) => theme.colors.gold};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const ValueLabel = styled.h3`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: ${({ theme }) => theme.colors.white};
  margin: 0;

  ${({ theme }) => theme.media.mobile} {
    font-size: ${({ theme }) => theme.fontSizes.md};
    letter-spacing: 1.5px;
  }
`

export default AboutPreview
