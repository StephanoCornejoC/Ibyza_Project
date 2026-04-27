import styled from 'styled-components';
import { Maximize2, BedDouble, Eye } from 'lucide-react';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { formatPriceUSD, formatArea } from '@/shared/utils/formatters';
import useUIStore from '@/shared/stores/useUIStore';

/**
 * DepartmentCard — Tarjeta de departamento individual. ADN inconsarq glass.
 *
 * Props:
 * - department: objeto con { id, codigo, tipo, area, precio, estado, piso }
 * - onViewDetail: función para abrir modal de detalle
 */
export const DepartmentCard = ({ department, project, onViewDetail }) => {
  const { openSeparationModal } = useUIStore();

  const canSeparate = department.estado === 'disponible';

  return (
    <Card $status={department.estado}>
      <CardAccent />
      <CardHeader>
        <DeptCode>{department.codigo}</DeptCode>
        <Badge status={department.estado} size="sm" />
      </CardHeader>

      <CardBody>
        <InfoRow>
          <InfoItem>
            <BedDouble size={14} />
            <span>{department.tipo || '—'}</span>
          </InfoItem>
          <InfoItem>
            <Maximize2 size={14} />
            <span>{formatArea(department.area)}</span>
          </InfoItem>
          {department.piso && (
            <InfoItem>
              <span>Piso {department.piso}</span>
            </InfoItem>
          )}
        </InfoRow>

        <PriceRow>
          {department.precio ? (
            <Price>{formatPriceUSD(department.precio)}</Price>
          ) : (
            <Price $consult>Consultar precio</Price>
          )}
        </PriceRow>
      </CardBody>

      <CardActions>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetail?.(department)}
        >
          <Eye size={14} /> Ver detalle
        </Button>

        {canSeparate && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => openSeparationModal(department, project)}
          >
            Separar
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

const statusBorderGlow = {
  disponible: 'rgba(74,222,128,0.3)',
  separado: 'rgba(251,191,36,0.3)',
  vendido: 'rgba(248,113,113,0.3)',
};

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
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.glass.border};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;

  &:hover {
    border-color: ${({ $status }) => statusBorderGlow[$status] || 'rgba(214,179,112,0.3)'};
    box-shadow: 0 0 24px ${({ $status }) => statusBorderGlow[$status] || 'rgba(214,179,112,0.15)'},
      0 8px 24px rgba(0,0,0,0.3);
    transform: translateY(-4px);

    ${CardAccent} {
      transform: scaleY(1);
    }
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DeptCode = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 700;
  letter-spacing: -0.5px;
  color: ${({ theme }) => theme.colors.white};
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const InfoRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};

  svg {
    color: ${({ theme }) => theme.colors.gold};
    opacity: 0.8;
  }
`;

const PriceRow = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const Price = styled.span`
  font-size: ${({ $consult, theme }) =>
    $consult ? theme.fontSizes.sm : theme.fontSizes.xl};
  font-weight: ${({ $consult }) => ($consult ? 300 : 700)};
  background: ${({ $consult, theme }) =>
    $consult ? 'none' : theme.gradients.goldText};
  -webkit-background-clip: ${({ $consult }) => ($consult ? 'unset' : 'text')};
  -webkit-text-fill-color: ${({ $consult }) =>
    $consult ? 'rgba(255,255,255,0.4)' : 'transparent'};
  background-clip: ${({ $consult }) => ($consult ? 'unset' : 'text')};
  color: ${({ $consult }) => ($consult ? 'rgba(255,255,255,0.4)' : 'unset')};
`;

const CardActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.xs};
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.glass.border};
  flex-wrap: wrap;

  ${({ theme }) => theme.media.mobile} {
    & > * { flex: 1; min-width: 0; }
  }
`;

export default DepartmentCard;
