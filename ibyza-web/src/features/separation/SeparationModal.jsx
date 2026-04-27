import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Building2 } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import SeparationForm from './components/SeparationForm';
import PaymentStep from './components/PaymentStep';
import TransferStep from './components/TransferStep';
import SeparationSuccess from './components/SeparationSuccess';
import useSeparation from './hooks/useSeparation';

/**
 * SeparationModal — Modal de 3 pasos con animaciones premium.
 * - Transición entre pasos: salida izquierda + entrada derecha (AnimatePresence)
 * - Stepper con línea de progreso animada
 * - Paso de éxito con checkmark SVG animado
 */
const SeparationModal = ({ isOpen, onClose, department, project }) => {
  const {
    step,
    formData,
    loading,
    error,
    success,
    separationResult,
    paymentMethod,
    setPaymentMethod,
    goToPayment,
    goBackToForm,
    processPayment,
    processTransfer,
    reset,
  } = useSeparation();

  const handleClose = () => {
    reset();
    onClose();
  };

  const titles = {
    1: 'Datos del comprador',
    2: 'Confirmar y pagar',
    3: '¡Separación completada!',
  };

  const stepVariants = {
    initial: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
    animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60, transition: { duration: 0.25 } }),
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={titles[step] || 'Separar departamento'}
      size="md"
      closeOnOverlay={step !== 2}
    >
      {/* Stepper con línea de progreso animada */}
      <StepsIndicator>
        <StepTrack>
          <motion.div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #C4973A, #FFE499, #D6B370)',
              borderRadius: '2px',
            }}
            animate={{ width: `${((step - 1) / 2) * 100}%` }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </StepTrack>

        {[1, 2, 3].map((s) => (
          <StepItem key={s}>
            <motion.div
              animate={
                step > s
                  ? { scale: [1, 1.2, 1], transition: { duration: 0.3 } }
                  : { scale: 1 }
              }
            >
              <StepDot $active={step === s} $done={step > s}>
                {step > s ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <motion.path
                      d="M2 7L5.5 10.5L12 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </svg>
                ) : s}
              </StepDot>
            </motion.div>
            <StepLabel $active={step === s} $done={step > s}>
              {s === 1 ? 'Datos' : s === 2 ? 'Pago' : 'Listo'}
            </StepLabel>
          </StepItem>
        ))}
      </StepsIndicator>

      {/* Contenido de cada paso con transición horizontal */}
      <StepContent>
        <AnimatePresence mode="wait" custom={1}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={1}
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <SeparationForm
                department={department}
                onSubmit={goToPayment}
                onCancel={handleClose}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={1}
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Tabs de metodo de pago */}
              <PaymentMethodTabs>
                <MethodTab
                  $active={paymentMethod === 'culqi'}
                  onClick={() => setPaymentMethod('culqi')}
                >
                  <CreditCard size={16} />
                  Tarjeta
                </MethodTab>
                <MethodTab
                  $active={paymentMethod === 'transferencia'}
                  onClick={() => setPaymentMethod('transferencia')}
                >
                  <Building2 size={16} />
                  Transferencia
                </MethodTab>
              </PaymentMethodTabs>

              {paymentMethod === 'culqi' ? (
                <PaymentStep
                  formData={formData}
                  department={department}
                  loading={loading}
                  error={error}
                  onPaymentToken={(token) => processPayment(token, department?.id)}
                  onBack={goBackToForm}
                />
              ) : (
                <TransferStep
                  formData={formData}
                  department={department}
                  project={project}
                  loading={loading}
                  error={error}
                  onSubmitTransfer={(file, deptId) => processTransfer(file, deptId)}
                  onBack={goBackToForm}
                />
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={1}
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <SuccessWrapper>
                {/* Checkmark SVG animado */}
                <CheckmarkCircle
                  as={motion.div}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                >
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <motion.circle
                      cx="24" cy="24" r="22"
                      stroke="#4ade80"
                      strokeWidth="2.5"
                      fill="rgba(74,222,128,0.08)"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                    />
                    <motion.path
                      d="M14 24L21 31L34 17"
                      stroke="#4ade80"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.5 }}
                    />
                  </svg>
                </CheckmarkCircle>

                <SeparationSuccess
                  result={separationResult}
                  formData={formData}
                  department={department}
                  onClose={handleClose}
                />
              </SuccessWrapper>
            </motion.div>
          )}
        </AnimatePresence>
      </StepContent>
    </Modal>
  );
};

const StepsIndicator = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  position: relative;
`;

const StepTrack = styled.div`
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  width: 55%;
  height: 2px;
  background: ${({ theme }) => theme.glass.border};
  z-index: 0;
  border-radius: 2px;
  overflow: hidden;
`;

const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  z-index: 1;
  flex: 1;
  max-width: 80px;
`;

const StepDot = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 700;
  transition: all ${({ theme }) => theme.transitions.normal};
  will-change: transform;

  background: ${({ theme, $active, $done }) => {
    if ($done) return theme.gradients.gold;
    if ($active) return 'rgba(214,179,112,0.15)';
    return 'rgba(255,255,255,0.04)';
  }};

  color: ${({ theme, $active, $done }) => {
    if ($done) return theme.colors.deepBg;
    if ($active) return theme.colors.gold;
    return 'rgba(255,255,255,0.3)';
  }};

  border: 2px solid ${({ theme, $active, $done }) => {
    if ($done) return 'transparent';
    if ($active) return theme.colors.gold;
    return theme.glass.border;
  }};

  box-shadow: ${({ $active }) =>
    $active ? '0 0 16px rgba(214,179,112,0.3)' : 'none'};
`;

const StepLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 500;
  color: ${({ theme, $active, $done }) => {
    if ($done || $active) return theme.colors.gold;
    return 'rgba(255,255,255,0.3)';
  }};
  letter-spacing: 0.05em;

  ${({ theme }) => theme.media.mobile} {
    font-size: 0.65rem;
  }
`;

const StepContent = styled.div`
  overflow: hidden;
`;

const SuccessWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const CheckmarkCircle = styled.div`
  filter: drop-shadow(0 0 16px rgba(74,222,128,0.4));
`;

const PaymentMethodTabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
  padding: 4px;
  border: 1px solid ${({ theme }) => theme.glass.border};
`;

const MethodTab = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  transition: all 0.25s ease;

  background: ${({ $active }) =>
    $active ? 'rgba(214,179,112,0.15)' : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.gold : theme.colors.textSecondary};
  box-shadow: ${({ $active }) =>
    $active ? '0 2px 8px rgba(214,179,112,0.15)' : 'none'};

  &:hover {
    background: ${({ $active }) =>
      $active ? 'rgba(214,179,112,0.15)' : 'rgba(255,255,255,0.04)'};
  }
`;

export default SeparationModal;
