import styled, { css } from 'styled-components';

/**
 * Button — Componente de botón base de IBYZA. ADN inconsarq.
 *
 * Props:
 * - variant: 'primary' | 'secondary' | 'outline' | 'ghost' (default: 'primary')
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 * - fullWidth: boolean
 * - loading: boolean — muestra spinner y deshabilita
 * - disabled: boolean
 * - as: permite renderizar como <a> o <Link>
 */
export const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  children,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      $fullWidth={fullWidth}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <ButtonSpinner /> : children}
    </StyledButton>
  );
};

// --- Spinner interno del botón ---
const ButtonSpinner = () => (
  <SpinnerRing aria-label="Cargando..." />
);

// --- Variantes de estilo ---
const variants = {
  primary: css`
    background: ${({ theme }) => theme.gradients.gold};
    color: ${({ theme }) => theme.colors.deepBg};
    border: 2px solid transparent;
    font-weight: 700;
    box-shadow: 0 4px 20px ${({ theme }) => theme.colors.goldGlow};

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #E7AA51 0%, #FFE499 50%, #D6B370 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(214,179,112,0.45), 0 0 0 1px rgba(214,179,112,0.3);
    }
  `,
  secondary: css`
    background: ${({ theme }) => theme.glass.card};
    backdrop-filter: ${({ theme }) => theme.glass.blur};
    color: ${({ theme }) => theme.colors.gold};
    border: 1.5px solid ${({ theme }) => theme.glass.borderGold};

    &:hover:not(:disabled) {
      background: rgba(214,179,112,0.12);
      border-color: ${({ theme }) => theme.colors.gold};
      transform: translateY(-2px);
      box-shadow: ${({ theme }) => theme.glass.shadowGold};
    }
  `,
  outline: css`
    background-color: transparent;
    color: rgba(255,255,255,0.85);
    border: 1.5px solid ${({ theme }) => theme.glass.border};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.glass.card};
      backdrop-filter: ${({ theme }) => theme.glass.blur};
      border-color: rgba(255,255,255,0.3);
      color: ${({ theme }) => theme.colors.white};
      transform: translateY(-1px);
    }
  `,
  ghost: css`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.gold};
    border: 2px solid transparent;

    &:hover:not(:disabled) {
      color: ${({ theme }) => theme.colors.goldLight};
      text-decoration: underline;
      text-underline-offset: 3px;
      text-decoration-color: ${({ theme }) => theme.colors.goldMid};
    }
  `,
};

// --- Tamaños ---
const sizes = {
  sm: css`
    padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
    font-size: ${({ theme }) => theme.fontSizes.sm};
  `,
  md: css`
    padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.xl}`};
    font-size: ${({ theme }) => theme.fontSizes.md};
  `,
  lg: css`
    padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xxl}`};
    font-size: ${({ theme }) => theme.fontSizes.lg};
  `,
};

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 600;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  text-decoration: none;
  white-space: nowrap;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};

  ${({ variant }) => variants[variant] || variants.primary}
  ${({ size }) => sizes[size] || sizes.md}

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.gold};
    outline-offset: 2px;
  }
`;

const SpinnerRing = styled.span`
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export default Button;
