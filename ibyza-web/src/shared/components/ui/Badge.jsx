import styled, { css } from 'styled-components';

/**
 * Badge — Indicador de estado para departamentos. ADN inconsarq glass.
 *
 * Props:
 * - status: 'disponible' | 'separado' | 'vendido' | 'en_construccion'
 * - size: 'sm' | 'md' (default: 'md')
 */
export const Badge = ({ status, size = 'md', ...props }) => {
  const labels = {
    disponible: 'Disponible',
    separado: 'Separado',
    vendido: 'Vendido',
    en_construccion: 'En construcción',
    en_venta: 'En venta',
    entregado: 'Entregado',
  };

  return (
    <StyledBadge $status={status} $size={size} {...props}>
      <Dot $status={status} />
      {labels[status] || status}
    </StyledBadge>
  );
};

// --- Paleta de colores por estado ---
const statusStyles = {
  disponible: css`
    background-color: rgba(34, 197, 94, 0.12);
    color: #4ade80;
    border-color: rgba(34, 197, 94, 0.35);
  `,
  separado: css`
    background-color: rgba(245, 158, 11, 0.12);
    color: #fbbf24;
    border-color: rgba(245, 158, 11, 0.35);
  `,
  vendido: css`
    background-color: rgba(239, 68, 68, 0.12);
    color: #f87171;
    border-color: rgba(239, 68, 68, 0.35);
  `,
  en_construccion: css`
    background-color: rgba(99, 102, 241, 0.12);
    color: #a5b4fc;
    border-color: rgba(99, 102, 241, 0.35);
  `,
  en_venta: css`
    background-color: rgba(214, 179, 112, 0.15);
    color: #FFE499;
    border-color: rgba(214, 179, 112, 0.4);
  `,
  entregado: css`
    background-color: rgba(255, 255, 255, 0.06);
    color: rgba(255,255,255,0.65);
    border-color: rgba(255, 255, 255, 0.15);
  `,
};

const dotColors = {
  disponible: '#4ade80',
  separado: '#fbbf24',
  vendido: '#f87171',
  en_construccion: '#a5b4fc',
  en_venta: '#FFE499',
  entregado: 'rgba(255,255,255,0.6)',
};

const StyledBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 600;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 1px solid;
  white-space: nowrap;
  backdrop-filter: blur(8px);
  letter-spacing: 0.03em;

  font-size: ${({ $size }) =>
    $size === 'sm' ? '0.72rem' : '0.8rem'};
  padding: ${({ $size, theme }) =>
    $size === 'sm'
      ? `2px ${theme.spacing.sm}`
      : `${theme.spacing.xs} ${theme.spacing.md}`};

  ${({ $status }) => statusStyles[$status] || statusStyles.disponible}
`;

const Dot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${({ $status }) => dotColors[$status] || 'rgba(255,255,255,0.6)'};
  flex-shrink: 0;
  box-shadow: 0 0 6px currentColor;
`;

export default Badge;
