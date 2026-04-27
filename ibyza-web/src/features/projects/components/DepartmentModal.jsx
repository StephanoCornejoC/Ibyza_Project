import styled from 'styled-components';
import { Modal } from '@/shared/components/ui/Modal';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { formatPriceUSD, formatArea } from '@/shared/utils/formatters';
import { Maximize2, BedDouble, Building2, DollarSign } from 'lucide-react';
import useUIStore from '@/shared/stores/useUIStore';

/**
 * DepartmentModal — Modal con el detalle del departamento. Glass premium.
 *
 * Props:
 * - department: objeto del departamento
 * - isOpen: boolean
 * - onClose: () => void
 */
export const DepartmentModal = ({ department, project, isOpen, onClose }) => {
  const { openSeparationModal } = useUIStore();

  if (!department) return null;

  const canSeparate = department.estado === 'disponible';

  const details = [
    { icon: BedDouble, label: 'Tipo', value: department.tipo || '—' },
    { icon: Maximize2, label: 'Área', value: formatArea(department.area) },
    { icon: Building2, label: 'Piso', value: department.piso ? `Piso ${department.piso}` : '—' },
    { icon: DollarSign, label: 'Precio', value: formatPriceUSD(department.precio) },
  ];

  const handleSeparar = () => {
    onClose();
    openSeparationModal(department, project);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Departamento ${department.codigo}`}
      size="md"
    >
      <ModalContent>
        <StatusRow>
          <Badge status={department.estado} />
        </StatusRow>

        <DetailsGrid>
          {details.map((detail) => {
            const Icon = detail.icon;
            return (
              <DetailItem key={detail.label}>
                <DetailIcon>
                  <Icon size={17} />
                </DetailIcon>
                <DetailInfo>
                  <DetailLabel>{detail.label}</DetailLabel>
                  <DetailValue>{detail.value}</DetailValue>
                </DetailInfo>
              </DetailItem>
            );
          })}
        </DetailsGrid>

        {department.descripcion && (
          <Description>
            <DescLabel>Descripción</DescLabel>
            <DescText>{department.descripcion}</DescText>
          </Description>
        )}

        {department.caracteristicas && department.caracteristicas.length > 0 && (
          <Features>
            <FeatLabel>Características</FeatLabel>
            <FeatList>
              {department.caracteristicas.map((f, i) => (
                <FeatItem key={i}>{f}</FeatItem>
              ))}
            </FeatList>
          </Features>
        )}

        <ActionRow>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          {canSeparate && (
            <Button variant="primary" onClick={handleSeparar}>
              Separar ahora
            </Button>
          )}
        </ActionRow>
      </ModalContent>
    </Modal>
  );
};

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const StatusRow = styled.div``;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: ${({ theme }) => theme.radii.md};
`;

const DetailIcon = styled.div`
  color: ${({ theme }) => theme.colors.goldMid};
  flex-shrink: 0;
  opacity: 0.85;
`;

const DetailInfo = styled.div``;

const DetailLabel = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 0.07em;
`;

const DetailValue = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white};
`;

const Description = styled.div``;

const DescLabel = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const DescText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: rgba(255,255,255,0.55);
  line-height: 1.75;
`;

const Features = styled.div``;

const FeatLabel = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gold};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const FeatList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const FeatItem = styled.li`
  background: rgba(214,179,112,0.12);
  border: 1px solid rgba(214,179,112,0.25);
  color: ${({ theme }) => theme.colors.gold};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 500;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.radii.full};
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid rgba(255,255,255,0.07);
  flex-wrap: wrap;

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column-reverse;
    & > * { width: 100%; }
  }
`;

export default DepartmentModal;
