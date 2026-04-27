import styled from 'styled-components'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Phone } from 'lucide-react'
import { ROUTES } from '@/shared/constants/routes'

/**
 * CTASection — Call-to-action que lleva a la pagina de contacto.
 */
const CTASection = () => (
  <Section>
    <Inner
      as={motion.div}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Eyebrow>— Da el siguiente paso —</Eyebrow>
      <Title>Tu mejor inversion te esta esperando</Title>
      <Subtitle>
        Agenda una cita con nuestro equipo y conoce los departamentos disponibles.
      </Subtitle>
      <ButtonsRow>
        <PrimaryBtn as={Link} to={ROUTES.CONTACT}>
          Contactar asesor
          <ArrowRight size={18} />
        </PrimaryBtn>
        <SecondaryBtn href="tel:+51993674174">
          <Phone size={16} />
          Llamar ahora
        </SecondaryBtn>
      </ButtonsRow>
    </Inner>
  </Section>
)

const Section = styled.section`
  padding: ${({ theme }) => `${theme.spacing.section} ${theme.spacing.lg}`};
  background: ${({ theme }) => theme.colors.deepBg};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: clamp(280px, 80vw, 600px);
    height: clamp(280px, 80vw, 600px);
    background: radial-gradient(circle, rgba(214,179,112,0.06) 0%, transparent 65%);
    pointer-events: none;
  }

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => `${theme.spacing.xxxl} ${theme.spacing.md}`};
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => `${theme.spacing.xxl} ${theme.spacing.md}`};
  }
`

const Inner = styled.div`
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
  width: 100%;
`

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
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  font-weight: 900;
  letter-spacing: -2px;
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  line-height: 1.1;

  ${({ theme }) => theme.media.tablet} {
    font-size: ${({ theme }) => theme.fontSizes['3xl']};
  }
`

const Subtitle = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.8;
  margin-bottom: ${({ theme }) => theme.spacing.xxl};

  ${({ theme }) => theme.media.tablet} {
    font-size: ${({ theme }) => theme.fontSizes.md};
    margin-bottom: ${({ theme }) => theme.spacing.xl};
  }

  ${({ theme }) => theme.media.mobile} {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    line-height: 1.7;
  }
`

const ButtonsRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  justify-content: center;
  flex-wrap: wrap;

  ${({ theme }) => theme.media.mobile} {
    gap: ${({ theme }) => theme.spacing.sm};
    flex-direction: column;
    align-items: stretch;
    max-width: 320px;
    margin: 0 auto;
  }
`

const PrimaryBtn = styled.a`
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
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(214,179,112,0.4);
  white-space: nowrap;

  &:hover {
    box-shadow: 0 8px 32px rgba(214,179,112,0.55);
    transform: translateY(-3px);
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

const SecondaryBtn = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: transparent;
  color: rgba(255,255,255,0.85);
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.md};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xxl}`};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid ${({ theme }) => theme.glass.border};
  text-decoration: none;
  transition: all 0.3s ease;
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

export default CTASection
