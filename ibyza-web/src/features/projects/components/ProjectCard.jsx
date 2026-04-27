import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/shared/components/ui/Badge';
import { buildProjectDetailRoute } from '@/shared/constants/routes';
import { formatPriceUSD } from '@/shared/utils/formatters';
import { fadeInUp } from '@/shared/utils/animations';

/**
 * ProjectCard — Tarjeta de proyecto con efecto tilt 3D.
 * - Perspective 1000px + rotateX/Y según posición del cursor
 * - Accent border lateral al hover
 * - Image zoom en hover
 * - Botón CTA con magnetic effect sutil
 *
 * Props:
 * - project: objeto con datos del proyecto
 * - index: número para delay escalonado
 */
export const ProjectCard = ({ project, index = 0 }) => {
  const cardRef = useRef(null)
  const ctaRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [ctaMag, setCtaMag] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e) => {
    // Skip en touch devices o pantallas chicas (sin hover preciso)
    if (typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches) return

    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14
    const y = -((e.clientY - rect.top) / rect.height - 0.5) * 14
    setTilt({ x, y })

    // Magnetic effect en el CTA
    const cta = ctaRef.current
    if (cta) {
      const ctaRect = cta.getBoundingClientRect()
      const ctaCenterX = ctaRect.left + ctaRect.width / 2
      const ctaCenterY = ctaRect.top + ctaRect.height / 2
      const distX = e.clientX - ctaCenterX
      const distY = e.clientY - ctaCenterY
      const strength = 0.25
      setCtaMag({ x: distX * strength, y: distY * strength })
    }
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
    setCtaMag({ x: 0, y: 0 })
    setIsHovered(false)
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
    >
      <CardWrapper
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
          transition: isHovered
            ? 'transform 0.1s ease'
            : 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transformStyle: 'preserve-3d',
        }}
      >
        <Card as={Link} to={buildProjectDetailRoute(project.slug)} $hovered={isHovered}>
          <CardAccent $hovered={isHovered} />

          <CardImageWrapper>
            {project.imagen_fachada ? (
              <CardImage
                src={project.imagen_fachada}
                alt={project.nombre}
                loading="lazy"
                style={{
                  transform: isHovered ? 'scale(1.07)' : 'scale(1)',
                  transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                }}
              />
            ) : (
              <ImageFallback />
            )}
            <ImageOverlay />
            <BadgeOverlay>
              <Badge status={project.estado || 'en_venta'} />
            </BadgeOverlay>
          </CardImageWrapper>

          <CardContent>
            {project.distrito && (
              <ProjectDistrict>
                <MapPin size={12} />
                {project.distrito}
              </ProjectDistrict>
            )}

            <ProjectName>{project.nombre}</ProjectName>

            <CardDivider />

            {project.descripcion_corta && (
              <ProjectDesc>{project.descripcion_corta}</ProjectDesc>
            )}

            <CardBottom>
              {project.precio_desde ? (
                <PriceBlock>
                  <PriceFrom>Desde</PriceFrom>
                  <PriceAmount>{formatPriceUSD(project.precio_desde)}</PriceAmount>
                </PriceBlock>
              ) : (
                <PriceBlock>
                  <PriceFrom>Consultar precio</PriceFrom>
                </PriceBlock>
              )}

              <ViewLink
                ref={ctaRef}
                style={{
                  transform: `translate(${ctaMag.x}px, ${ctaMag.y}px)`,
                  transition: isHovered ? 'transform 0.15s ease' : 'transform 0.4s ease',
                }}
              >
                Ver proyecto <ArrowRight size={14} />
              </ViewLink>
            </CardBottom>
          </CardContent>
        </Card>
      </CardWrapper>
    </motion.div>
  )
}

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
  z-index: 2;
`

const Card = styled.a`
  position: relative;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.glass.card};
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid ${({ $hovered, theme }) =>
    $hovered ? theme.colors.borderGold : theme.glass.border};
  box-shadow: ${({ $hovered, theme }) =>
    $hovered
      ? `${theme.glass.shadowGold}, 0 20px 60px rgba(0,0,0,0.5)`
      : theme.glass.shadow};
  text-decoration: none;
  transition: border-color 0.35s ease, box-shadow 0.35s ease;
`

const CardImageWrapper = styled.div`
  position: relative;
  height: 220px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.primary};

  ${({ theme }) => theme.media.tablet} {
    height: 200px;
  }

  ${({ theme }) => theme.media.mobile} {
    height: 170px;
  }
`

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  will-change: transform;
`

const ImageFallback = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, rgba(13,31,51,0.8) 100%);
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

const BadgeOverlay = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
`

const CardContent = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  flex: 1;

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.md};
  }
`

const ProjectDistrict = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.fontSizes.eyebrow};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: ${({ theme }) => theme.colors.gold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};

  svg {
    flex-shrink: 0;
    opacity: 0.8;
  }
`

const ProjectName = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: 900;
  letter-spacing: -1px;
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: 0;
  line-height: 1.15;

  ${({ theme }) => theme.media.mobile} {
    font-size: 1.25rem;
    letter-spacing: -0.5px;
  }
`

const CardDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.gradients.goldDivider};
  margin: ${({ theme }) => `${theme.spacing.sm} 0`};
  opacity: 0.35;
`

const ProjectDesc = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.85;
  flex: 1;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const CardBottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.glass.border};
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`

const PriceBlock = styled.div``

const PriceFrom = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`

const PriceAmount = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 700;
  background: ${({ theme }) => theme.gradients.goldText};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const ViewLink = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gold};
  will-change: transform;
`

export default ProjectCard
