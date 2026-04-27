import styled, { keyframes } from 'styled-components';

/**
 * Spinner — Indicador de carga circular.
 *
 * Props:
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 * - color: string hex (default: usa theme.colors.gold)
 * - centered: boolean — envuelve en un div centrado
 *
 * Uso:
 *   <Spinner size="lg" centered />
 */
export const Spinner = ({ size = 'md', color, centered = false }) => {
  if (centered) {
    return (
      <CenterWrapper>
        <SpinnerRing size={size} $color={color} role="status" aria-label="Cargando" />
      </CenterWrapper>
    );
  }
  return <SpinnerRing size={size} $color={color} role="status" aria-label="Cargando" />;
};

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const sizeMap = {
  sm: '20px',
  md: '36px',
  lg: '52px',
};

const borderMap = {
  sm: '2px',
  md: '3px',
  lg: '4px',
};

const SpinnerRing = styled.div`
  display: inline-block;
  width: ${({ size }) => sizeMap[size] || sizeMap.md};
  height: ${({ size }) => sizeMap[size] || sizeMap.md};
  border: ${({ size }) => borderMap[size] || borderMap.md} solid
    ${({ theme, $color }) => $color || theme.colors.goldLight};
  border-top-color: ${({ theme, $color }) => $color || theme.colors.gold};
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;

const CenterWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  width: 100%;
`;

export default Spinner;
