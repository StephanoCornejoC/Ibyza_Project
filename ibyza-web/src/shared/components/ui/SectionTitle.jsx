import styled from 'styled-components';
import { motion } from 'framer-motion';

/**
 * SectionTitle — Encabezado estándar para secciones. ADN inconsarq.
 * Eyebrow label dorado UPPERCASE con guiones, H2 Playfair 900, divider dorado gradiente.
 *
 * Props:
 * - eyebrow: string — texto pequeño encima del título (opcional)
 * - title: string — título principal
 * - subtitle: string — descripción debajo del título (opcional)
 * - align: 'left' | 'center' | 'right' (default: 'center')
 * - light: boolean — versión con textos claros para fondos oscuros (default false)
 */
export const SectionTitle = ({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  light = false,
}) => {
  return (
    <TitleWrapper $align={align}>
      {eyebrow && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <Eyebrow>— {eyebrow.toUpperCase()} —</Eyebrow>
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: eyebrow ? 0.1 : 0 }}
      >
        <Title>{title}</Title>
        <GoldDivider $align={align} />
      </motion.div>
      {subtitle && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Subtitle $align={align}>{subtitle}</Subtitle>
        </motion.div>
      )}
    </TitleWrapper>
  );
};

const TitleWrapper = styled.div`
  text-align: ${({ $align }) => $align};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};

  ${({ theme }) => theme.media.mobile} {
    margin-bottom: ${({ theme }) => theme.spacing.xl};
  }
`;

const Eyebrow = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.eyebrow};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: ${({ theme }) => theme.colors.gold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  font-weight: 900;
  letter-spacing: -2px;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  line-height: 1.05;

  ${({ theme }) => theme.media.tablet} {
    font-size: 2.4rem;
    letter-spacing: -1px;
  }

  ${({ theme }) => theme.media.mobile} {
    font-size: 1.85rem;
    letter-spacing: -0.5px;
  }
`;

const GoldDivider = styled.div`
  height: 1px;
  width: 80px;
  background: ${({ theme }) => theme.gradients.goldDivider};
  margin-top: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  margin-left: ${({ $align }) =>
    $align === 'center' ? 'auto' : $align === 'right' ? 'auto' : '0'};
  margin-right: ${({ $align }) =>
    $align === 'center' ? 'auto' : $align === 'right' ? '0' : 'auto'};
  box-shadow: 0 0 10px rgba(214,179,112,0.3);
`;

const Subtitle = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 300;
  letter-spacing: 0.2px;
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 600px;
  line-height: 1.85;
  margin: 0 ${({ $align }) => ($align === 'center' ? 'auto' : '0')};

  ${({ theme }) => theme.media.tablet} {
    font-size: ${({ theme }) => theme.fontSizes.md};
  }
`;

export default SectionTitle;
