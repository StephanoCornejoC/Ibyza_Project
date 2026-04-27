import { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, useInView } from 'framer-motion';
import { SectionTitle } from '@/shared/components/ui/SectionTitle';
import { formatDate } from '@/shared/utils/formatters';
import { Calendar, Camera } from 'lucide-react';

/**
 * ProgressUpdates — Timeline animado de avances de obra.
 * - La línea vertical se "dibuja" en base al scroll (height animado)
 * - Cada item entra desde la izquierda/derecha alternando
 * - Cada dot tiene un glow pulsante al entrar en el viewport
 *
 * Props:
 * - advances: array de { id, fecha, descripcion, imagenes[], porcentaje }
 */
export const ProgressUpdates = ({ advances = [] }) => {
  const timelineRef = useRef(null)
  const lineRef = useRef(null)

  // Anima la línea vertical usando IntersectionObserver + scroll
  useEffect(() => {
    const container = timelineRef.current
    const line = lineRef.current
    if (!container || !line) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          line.style.transition = 'height 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          line.style.height = '100%'
        }
      },
      { threshold: 0.05 }
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  if (!advances || advances.length === 0) return null

  return (
    <Section>
      <SectionTitle
        eyebrow="Obra en progreso"
        title="Avances del proyecto"
        align="left"
      />

      <Timeline ref={timelineRef}>
        {/* Línea vertical animada */}
        <TimelineLine ref={lineRef} />

        {advances.map((advance, index) => (
          <TimelineItemWrapper
            key={advance.id}
            as={motion.div}
            initial={{ opacity: 0, x: index % 2 === 0 ? -32 : 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{
              duration: 0.6,
              delay: index * 0.08,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <TimelineItem>
              <DotWrapper>
                <TimelineDot $hasPct={advance.porcentaje != null}>
                  {advance.porcentaje != null ? `${advance.porcentaje}%` : ''}
                </TimelineDot>
                <DotGlow />
              </DotWrapper>

              <TimelineContent>
                <AdvanceDate>
                  <Calendar size={12} />
                  {formatDate(advance.fecha)}
                </AdvanceDate>
                {advance.titulo && <AdvanceTitle>{advance.titulo}</AdvanceTitle>}
                <AdvanceDesc>{advance.contenido || advance.descripcion}</AdvanceDesc>

                {advance.imagen && (
                  <AdvanceImages>
                    <AdvanceImgLabel>
                      <Camera size={12} />
                      1 foto
                    </AdvanceImgLabel>
                    <ImagesRow>
                      <AdvanceImg
                        src={advance.imagen}
                        alt={`Avance ${formatDate(advance.fecha)}`}
                        loading="lazy"
                      />
                    </ImagesRow>
                  </AdvanceImages>
                )}

                {advance.porcentaje != null && (
                  <ProgressBarWrapper>
                    <ProgressBarBg>
                      <ProgressFillAnimated pct={advance.porcentaje} />
                    </ProgressBarBg>
                    <ProgressLabel>{advance.porcentaje}%</ProgressLabel>
                  </ProgressBarWrapper>
                )}
              </TimelineContent>
            </TimelineItem>
          </TimelineItemWrapper>
        ))}
      </Timeline>
    </Section>
  )
}

/** Barra de progreso animada al entrar en viewport */
const ProgressFillAnimated = ({ pct }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <ProgressFill
      ref={ref}
      style={{
        width: isInView ? `${Math.min(Math.max(pct, 0), 100)}%` : '0%',
        transition: 'width 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
    />
  )
}

const Section = styled.section`
  padding: ${({ theme }) => `${theme.spacing.section} 0`};

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => `${theme.spacing.xxxl} 0`};
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => `${theme.spacing.xxl} 0`};
  }
`

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
`

const TimelineLine = styled.div`
  position: absolute;
  left: 19px;
  top: 0;
  height: 0;
  width: 2px;
  background: linear-gradient(
    to bottom,
    ${({ theme }) => theme.colors.gold} 0%,
    rgba(214,179,112,0.15) 100%
  );
  border-radius: 2px;
  z-index: 0;
  will-change: height;
`

const TimelineItemWrapper = styled.div`
  will-change: opacity, transform;
`

const TimelineItem = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.xxl};
  position: relative;

  ${({ theme }) => theme.media.mobile} {
    gap: ${({ theme }) => theme.spacing.md};
    padding-bottom: ${({ theme }) => theme.spacing.xl};
  }
`

const DotWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
  z-index: 1;
`

const TimelineDot = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.deepBg};
  border: 2px solid ${({ theme }) => theme.colors.gold};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gold};
  box-shadow: 0 0 16px rgba(214,179,112,0.25);
  position: relative;
  z-index: 2;
`

const DotGlow = styled.div`
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: rgba(214,179,112,0.08);
  animation: glowBorder 3s ease-in-out infinite;
  pointer-events: none;
  z-index: 1;
`

const TimelineContent = styled.div`
  flex: 1;
  min-width: 0;
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.glass.border};
  border-radius: 14px;
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.glass.shadow};
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderGold};
    box-shadow: ${({ theme }) => theme.glass.shadowGold};
    transform: translateX(4px);
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.md};
  }
`

const AdvanceDate = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.fontSizes.eyebrow};
  color: ${({ theme }) => theme.colors.gold};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  svg { flex-shrink: 0; }
`

const AdvanceTitle = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const AdvanceDesc = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.85;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const AdvanceImages = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const AdvanceImgLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const ImagesRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`

const AdvanceImg = styled.img`
  width: 100%;
  max-width: 220px;
  height: auto;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.glass.border};
  transition: transform ${({ theme }) => theme.transitions.fast}, border-color 0.2s ease;

  &:hover {
    transform: scale(1.04);
    border-color: ${({ theme }) => theme.colors.borderGold};
  }
`

const ProgressBarWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`

const ProgressBarBg = styled.div`
  flex: 1;
  height: 4px;
  background: rgba(255,255,255,0.06);
  border-radius: ${({ theme }) => theme.radii.full};
  overflow: hidden;
`

const ProgressFill = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.gradients.gold};
  border-radius: ${({ theme }) => theme.radii.full};
  box-shadow: 0 0 8px rgba(214,179,112,0.4);
`

const ProgressLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gold};
  min-width: 32px;
  text-align: right;
`

export default ProgressUpdates
