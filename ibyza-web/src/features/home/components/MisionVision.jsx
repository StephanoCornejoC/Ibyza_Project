import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Target, Eye, Award } from 'lucide-react';
import { SectionTitle } from '@/shared/components/ui/SectionTitle';

/**
 * MisionVision — Sección de misión, visión y valores en la Home.
 * ADN inconsarq: cards glass con número grande como watermark, hover glow dorado, accent border.
 *
 * Props:
 * - content: datos del CMS { mision, vision, propuesta_valor }
 */
const MisionVision = ({ content }) => {
  const items = [
    {
      icon: Target,
      number: '01',
      label: 'Nuestra Misión',
      text:
        content?.mision ||
        'Desarrollar proyectos inmobiliarios en áreas consolidadas de Arequipa, generando mayor valor para nuestros clientes a través de ubicaciones estratégicas, diseño funcional y acabados de calidad.',
    },
    {
      icon: Eye,
      number: '02',
      label: 'Nuestra Visión',
      text:
        content?.vision ||
        'Ser el referente local en desarrollo inmobiliario sostenible, reconocidos por la calidad de nuestros proyectos y el valor que generamos para inversionistas y familias.',
    },
    {
      icon: Award,
      number: '03',
      label: 'Nuestro Compromiso',
      text:
        content?.propuesta_valor ||
        'Dedicamos especial atención a escuchar a nuestros clientes y mejorar continuamente. Cada proyecto es construido con los más altos estándares, garantizando que tu inversión sea segura.',
    },
  ];

  return (
    <Section>
      <GoldDividerTop />
      <SectionContent>
        <SectionTitle
          eyebrow="Quiénes somos"
          title="Construimos con propósito"
          light
        />

        <CardsGrid>
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
              >
                <Card>
                  {/* Watermark número */}
                  <CardWatermark>{item.number}</CardWatermark>
                  {/* Accent border lateral */}
                  <CardAccent />

                  <CardIconWrapper>
                    <Icon size={26} />
                  </CardIconWrapper>
                  <CardLabel>{item.label}</CardLabel>
                  <CardText>{item.text}</CardText>
                </Card>
              </motion.div>
            );
          })}
        </CardsGrid>
      </SectionContent>
      <GoldDividerBottom />
    </Section>
  );
};

const Section = styled.section`
  background: ${({ theme }) => theme.gradients.section};
  padding: ${({ theme }) => `${theme.spacing.section} 0`};
  position: relative;

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => `${theme.spacing.xxxl} 0`};
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => `${theme.spacing.xxl} 0`};
  }
`;

const GoldDividerTop = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.gradients.goldDivider};
  opacity: 0.5;
  margin-bottom: 0;
`;

const GoldDividerBottom = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.gradients.goldDivider};
  opacity: 0.5;
  margin-top: 0;
`;

const SectionContent = styled.div`
  max-width: ${({ theme }) => theme.container.maxWidth};
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.section} ${theme.spacing.lg}`};

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => `${theme.spacing.xxxl} ${theme.spacing.md}`};
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => `${theme.spacing.xxl} ${theme.spacing.md}`};
  }
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.xl};

  ${({ theme }) => theme.media.desktop} {
    grid-template-columns: 1fr;
    max-width: 600px;
    margin: 0 auto;
  }

  ${({ theme }) => theme.media.mobile} {
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const CardAccent = styled.div`
  position: absolute;
  left: 0;
  top: 10%;
  height: 80%;
  width: 3px;
  background: ${({ theme }) => theme.gradients.goldDivider};
  transform: scaleY(0);
  transition: transform 0.3s ease;
  border-radius: 0 2px 2px 0;
`;

const Card = styled.div`
  position: relative;
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.glass.border};
  border-radius: 14px;
  padding: ${({ theme }) => theme.spacing.xxl};
  box-shadow: ${({ theme }) => theme.glass.shadow};
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => theme.spacing.xl};
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.lg};
  }

  &:hover {
    background: ${({ theme }) => theme.glass.cardHover};
    border-color: ${({ theme }) => theme.colors.borderGold};
    transform: translateY(-8px);
    box-shadow: ${({ theme }) => theme.glass.shadowGold}, 0 20px 60px rgba(0,0,0,0.4);

    ${CardAccent} {
      transform: scaleY(1);
    }
  }
`;

const CardWatermark = styled.div`
  position: absolute;
  right: -10px;
  bottom: -20px;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(4rem, 12vw, 8rem);
  font-weight: 900;
  color: white;
  opacity: 0.03;
  line-height: 1;
  pointer-events: none;
  user-select: none;
`;

const CardIconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: rgba(214,179,112,0.1);
  border: 1px solid rgba(214,179,112,0.2);
  color: ${({ theme }) => theme.colors.gold};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const CardLabel = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: 900;
  letter-spacing: -1px;
  color: ${({ theme }) => theme.colors.gold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const CardText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.85;
`;

export default MisionVision;
