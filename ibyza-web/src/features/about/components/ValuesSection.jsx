import { useRef, useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { Shield, Star, Users, Zap, Heart, Award } from 'lucide-react'
import { SectionTitle } from '@/shared/components/ui/SectionTitle'
import { staggerContainer, fadeInUp } from '@/shared/utils/animations'

/**
 * ValuesSection — Cards de valores con:
 * - Entrada escalonada con whileInView
 * - Efecto tilt 3D sutil en hover
 * - Icon micro-bounce al entrar
 * - Borde dorado + scale en hover
 */
const VALUES = [
  {
    icon: Shield,
    title: 'Confianza',
    description:
      'Construimos relaciones duraderas basadas en la transparencia y el compromiso con nuestros clientes.',
  },
  {
    icon: Star,
    title: 'Calidad',
    description:
      'Cada proyecto es ejecutado con los más altos estándares de construcción y acabados premium.',
  },
  {
    icon: Users,
    title: 'Servicio',
    description:
      'Acompañamos a nuestros clientes en cada etapa: desde la elección hasta la entrega de su hogar.',
  },
  {
    icon: Zap,
    title: 'Innovación',
    description:
      'Incorporamos las últimas tendencias en diseño arquitectónico y tecnologías sostenibles.',
  },
  {
    icon: Heart,
    title: 'Compromiso',
    description:
      'Nos comprometemos con la satisfacción total de nuestros clientes y el desarrollo de la comunidad.',
  },
  {
    icon: Award,
    title: 'Excelencia',
    description:
      'Buscamos superar expectativas en cada proyecto, cumpliendo plazos y promesas con integridad.',
  },
]

const ValuesSection = () => {
  return (
    <Section>
      <SectionWrapper>
        <SectionTitle
          eyebrow="Nuestros valores"
          title="Lo que nos define"
          subtitle="Los principios que guían cada decisión que tomamos como empresa."
        />

        <ValuesGrid
          as={motion.div}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {VALUES.map((value, index) => (
            <motion.div key={value.title} variants={fadeInUp}>
              <ValueCardTilt value={value} index={index} />
            </motion.div>
          ))}
        </ValuesGrid>
      </SectionWrapper>
    </Section>
  )
}

/** Card con tilt 3D y micro-bounce del ícono */
const ValueCardTilt = ({ value }) => {
  const Icon = value.icon
  const cardRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10
    const y = -((e.clientY - rect.top) / rect.height - 0.5) * 10
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
        transformStyle: 'preserve-3d',
      }}
    >
      <ValueCard $hovered={isHovered}>
        <CardAccent $hovered={isHovered} />

        <motion.div
          animate={isHovered ? { scale: 1.15, rotate: [0, -5, 5, 0] } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <ValueIconWrapper $hovered={isHovered}>
            <Icon size={24} />
          </ValueIconWrapper>
        </motion.div>

        <ValueTitle>{value.title}</ValueTitle>
        <ValueDescription>{value.description}</ValueDescription>
      </ValueCard>
    </CardWrapper>
  )
}

const Section = styled.section`
  padding: ${({ theme }) => `${theme.spacing.section} 0`};
  background: ${({ theme }) => theme.gradients.section};
`

const SectionWrapper = styled.div`
  max-width: ${({ theme }) => theme.container.maxWidth};
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.lg};
`

const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.xl};

  ${({ theme }) => theme.media.desktop} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${({ theme }) => theme.media.tablet} {
    grid-template-columns: 1fr;
  }
`

const CardWrapper = styled.div`
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
`

const ValueCard = styled.div`
  position: relative;
  background: ${({ $hovered, theme }) => ($hovered ? theme.glass.cardHover : theme.glass.card)};
  border: 1px solid ${({ $hovered, theme }) => ($hovered ? theme.colors.borderGold : theme.glass.border)};
  border-radius: 14px;
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ $hovered, theme }) =>
    $hovered
      ? `${theme.glass.shadowGold}, 0 20px 60px rgba(0,0,0,0.4)`
      : theme.glass.shadow};
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
`

const ValueIconWrapper = styled.div`
  width: 52px;
  height: 52px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $hovered }) =>
    $hovered ? 'rgba(214,179,112,0.18)' : 'rgba(214,179,112,0.1)'};
  border: 1px solid ${({ $hovered }) =>
    $hovered ? 'rgba(214,179,112,0.4)' : 'rgba(214,179,112,0.2)'};
  color: ${({ theme }) => theme.colors.gold};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  transition: background 0.3s ease, border-color 0.3s ease;
`

const ValueTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: 900;
  letter-spacing: -1px;
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const ValueDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.85;
`

export default ValuesSection
