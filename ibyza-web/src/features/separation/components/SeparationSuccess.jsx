import styled from 'styled-components';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, Phone } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { formatPriceUSD } from '@/shared/utils/formatters';

/**
 * SeparationSuccess — Pantalla de éxito tras completar la separación (Paso 3). ADN inconsarq.
 */
const SeparationSuccess = ({ result, formData, department, onClose }) => {
  return (
    <SuccessWrapper>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <CheckIcon>
          <CheckCircle size={52} />
        </CheckIcon>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <SuccessTitle>¡Separación exitosa!</SuccessTitle>
        <HeroDivider />
        <SuccessSubtitle>
          Tu departamento ha sido reservado. Te enviamos un correo de confirmación.
        </SuccessSubtitle>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        style={{ width: '100%' }}
      >
        <ResultCard>
          {result?.numero_operacion && (
            <ResultRow>
              <ResultLabel>N° de operación</ResultLabel>
              <ResultValue $highlight>{result.numero_operacion}</ResultValue>
            </ResultRow>
          )}
          <ResultRow>
            <ResultLabel>Departamento</ResultLabel>
            <ResultValue>{department?.codigo}</ResultValue>
          </ResultRow>
          <ResultRow>
            <ResultLabel>Monto pagado</ResultLabel>
            <ResultValue>{formatPriceUSD(formData?.monto)}</ResultValue>
          </ResultRow>
          <ResultRow>
            <ResultLabel>Comprador</ResultLabel>
            <ResultValue>{formData?.nombre} {formData?.apellido}</ResultValue>
          </ResultRow>
        </ResultCard>

        <ContactNote>
          <ContactItem>
            <Mail size={15} />
            <span>Confirmación enviada a <strong>{formData?.email}</strong></span>
          </ContactItem>
          <ContactItem>
            <Phone size={15} />
            <span>Un asesor se pondrá en contacto contigo pronto.</span>
          </ContactItem>
        </ContactNote>
      </motion.div>

      <Button variant="primary" fullWidth onClick={onClose}>
        Listo
      </Button>
    </SuccessWrapper>
  );
};

const SuccessWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md} 0;
`;

const CheckIcon = styled.div`
  color: #4ade80;
  background: rgba(74, 222, 128, 0.08);
  border: 1px solid rgba(74, 222, 128, 0.2);
  width: 92px;
  height: 92px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 0 20px rgba(74,222,128,0.25));
`;

const SuccessTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: 900;
  letter-spacing: -1px;
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: 0;
`;

const HeroDivider = styled.div`
  width: 48px;
  height: 2px;
  background: ${({ theme }) => theme.gradients.goldDivider};
  margin: ${({ theme }) => `${theme.spacing.sm} auto`};
  opacity: 0.7;
`;

const SuccessSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 420px;
  line-height: 1.85;
`;

const ResultCard = styled.div`
  border: 1px solid rgba(214,179,112,0.2);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: left;
  background: rgba(214,179,112,0.03);
`;

const ResultRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  border-bottom: 1px solid ${({ theme }) => theme.glass.border};

  &:last-child {
    border-bottom: none;
  }
`;

const ResultLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ResultValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white};
  ${({ $highlight, theme }) => $highlight && `
    background: ${theme.gradients.goldText};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  `}
`;

const ContactNote = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  text-align: left;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};

  svg {
    color: ${({ theme }) => theme.colors.gold};
    flex-shrink: 0;
    opacity: 0.8;
  }

  strong {
    color: rgba(255,255,255,0.8);
    font-weight: 600;
  }
`;

export default SeparationSuccess;
