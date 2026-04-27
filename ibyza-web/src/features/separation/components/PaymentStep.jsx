import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Spinner } from '@/shared/components/ui/Spinner';
import { formatPriceUSD } from '@/shared/utils/formatters';

/**
 * PaymentStep — Paso 2 del flujo de separación: pago con Culqi. ADN inconsarq.
 *
 * Props:
 * - formData, department, loading, error, onPaymentToken, onBack
 */
const PaymentStep = ({
  formData,
  department,
  loading,
  error,
  onPaymentToken,
  onBack,
}) => {
  const monto = formData?.monto || department?.precio || 0;
  const MONTO_CENTAVOS = monto * 100;
  const CULQI_PUBLIC_KEY = import.meta.env.VITE_CULQI_PUBLIC_KEY || '';

  const [culqiError, setCulqiError] = useState(null);

  const setupCulqi = useCallback(() => {
    if (!window.Culqi) {
      if (import.meta.env.DEV) {
        console.warn('[PaymentStep] Culqi.js no esta disponible todavia');
      }
      return;
    }

    window.Culqi.publicKey = CULQI_PUBLIC_KEY;

    window.Culqi.settings({
      title: 'IBYZA',
      currency: 'PEN',
      description: `Separacion: ${department?.codigo || 'Departamento'}`,
      amount: MONTO_CENTAVOS,
    });

    window.culqi = () => {
      if (window.Culqi.token) {
        setCulqiError(null);
        onPaymentToken(window.Culqi.token.id);
      } else if (window.Culqi.error) {
        const msg = window.Culqi.error.user_message || window.Culqi.error.message || 'Error al procesar la tarjeta. Intenta con otra.';
        setCulqiError(msg);
      }
    };
  }, [CULQI_PUBLIC_KEY, MONTO_CENTAVOS, department, onPaymentToken]);

  useEffect(() => {
    setupCulqi();
    return () => {
      if (window.culqi) {
        window.culqi = null;
      }
    };
  }, [setupCulqi]);

  const handleOpenCulqi = () => {
    if (!window.Culqi) {
      alert('El sistema de pago no está disponible. Recarga la página e intenta nuevamente.');
      return;
    }
    setupCulqi();
    window.Culqi.open();
  };

  if (loading) {
    return (
      <LoadingWrapper>
        <Spinner size="lg" />
        <LoadingText>Procesando tu pago...</LoadingText>
        <LoadingSubtext>No cierres esta ventana</LoadingSubtext>
      </LoadingWrapper>
    );
  }

  return (
    <StepWrapper>
      {/* Resumen del pago */}
      <PaymentSummary>
        <SummaryHeader>Resumen del pago</SummaryHeader>
        <SummaryItems>
          <SummaryItem>
            <SummaryKey>Comprador</SummaryKey>
            <SummaryValue>{formData?.nombre} {formData?.apellido}</SummaryValue>
          </SummaryItem>
          <SummaryItem>
            <SummaryKey>Email</SummaryKey>
            <SummaryValue>{formData?.email}</SummaryValue>
          </SummaryItem>
          <SummaryItem>
            <SummaryKey>Departamento</SummaryKey>
            <SummaryValue>{department?.codigo || '—'}</SummaryValue>
          </SummaryItem>
          <SummaryItem $total>
            <SummaryKey>Total a pagar</SummaryKey>
            <TotalValue>{formatPriceUSD(monto)}</TotalValue>
          </SummaryItem>
        </SummaryItems>
      </PaymentSummary>

      {/* Indicador de seguridad */}
      <SecurityNote>
        <Lock size={13} />
        <span>Pago seguro procesado por Culqi. Tus datos están protegidos con cifrado SSL.</span>
      </SecurityNote>

      {(error || culqiError) && (
        <ErrorAlert>
          <AlertCircle size={16} />
          <span>{culqiError || error}</span>
        </ErrorAlert>
      )}

      {!CULQI_PUBLIC_KEY && (
        <WarningAlert>
          <AlertCircle size={16} />
          <span>
            <strong>Dev:</strong> VITE_CULQI_PUBLIC_KEY no está configurada.
            Configura el archivo .env con tu llave pública de Culqi.
          </span>
        </WarningAlert>
      )}

      <Actions>
        <Button variant="outline" onClick={onBack} disabled={loading}>
          Volver
        </Button>
        <PayButton onClick={handleOpenCulqi} disabled={loading || !CULQI_PUBLIC_KEY}>
          <CreditCard size={18} />
          Pagar {formatPriceUSD(monto)}
        </PayButton>
      </Actions>
    </StepWrapper>
  );
};

const StepWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xxl} 0;
`;

const LoadingText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white};
`;

const LoadingSubtext = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const PaymentSummary = styled.div`
  background: rgba(214,179,112,0.04);
  border: 1px solid rgba(214,179,112,0.2);
  border-radius: 14px;
  overflow: hidden;
`;

const SummaryHeader = styled.div`
  background: rgba(214,179,112,0.08);
  color: ${({ theme }) => theme.colors.gold};
  font-size: ${({ theme }) => theme.fontSizes.eyebrow};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 4px;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  border-bottom: 1px solid rgba(214,179,112,0.15);
`;

const SummaryItems = styled.div`
  display: flex;
  flex-direction: column;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  border-bottom: 1px solid ${({ theme }) => theme.glass.border};
  background: ${({ $total }) => $total ? 'rgba(214,179,112,0.05)' : 'transparent'};

  &:last-child {
    border-bottom: none;
  }
`;

const SummaryKey = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SummaryValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  color: rgba(255,255,255,0.8);
`;

const TotalValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 700;
  background: ${({ theme }) => theme.gradients.goldText};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const SecurityNote = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.glass.border};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};

  svg {
    color: #4ade80;
    flex-shrink: 0;
  }
`;

const ErrorAlert = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: #f87171;

  svg { flex-shrink: 0; }
`;

const WarningAlert = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  background: rgba(245, 158, 11, 0.06);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 300;
  color: rgba(255,255,255,0.6);

  svg { flex-shrink: 0; color: #fbbf24; margin-top: 2px; }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column-reverse;
    & > * { width: 100%; justify-content: center; }
  }
`;

const PayButton = styled.button`
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
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: none;
  box-shadow: 0 4px 20px rgba(214,179,112,0.4);

  &:hover:not(:disabled) {
    box-shadow: 0 8px 28px rgba(214,179,112,0.5);
    transform: translateY(-2px);
    background: linear-gradient(135deg, #E7AA51 0%, #FFE499 50%, #D6B370 100%);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export default PaymentStep;
