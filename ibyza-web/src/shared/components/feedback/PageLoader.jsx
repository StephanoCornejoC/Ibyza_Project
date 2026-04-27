import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

/**
 * PageLoader — Pantalla de carga a nivel de página. ADN inconsarq — fondo negro profundo.
 *
 * Uso:
 *   <PageLoader />
 *   <Suspense fallback={<PageLoader />}>...</Suspense>
 */
export const PageLoader = () => {
  return (
    <LoaderWrapper
      as={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <LogoMark>IBYZA</LogoMark>
      <GoldLine />
      <DotsRow>
        <Dot $delay={0} />
        <Dot $delay={0.15} />
        <Dot $delay={0.3} />
      </DotsRow>
    </LoaderWrapper>
  );
};

const pulse = keyframes`
  0%, 100% { transform: scale(0.6); opacity: 0.4; }
  50% { transform: scale(1); opacity: 1; }
`;

const LoaderWrapper = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.deepBg};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg};
  z-index: 9999;
`;

const LogoMark = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 3.5rem;
  font-weight: 900;
  letter-spacing: -2px;
  background: ${({ theme }) => theme.gradients.goldText};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const GoldLine = styled.div`
  width: 60px;
  height: 2px;
  background: ${({ theme }) => theme.gradients.goldDivider};
  border-radius: 2px;
  box-shadow: 0 0 12px rgba(214,179,112,0.4);
`;

const DotsRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Dot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.gold};
  animation: ${pulse} 0.9s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
`;

export default PageLoader;
