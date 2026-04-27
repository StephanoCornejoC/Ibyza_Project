import { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, BedDouble, DollarSign, Lock, ShoppingCart } from 'lucide-react';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { formatPriceUSD, formatArea } from '@/shared/utils/formatters';
import useUIStore from '@/shared/stores/useUIStore';

/**
 * InteractiveFloorPlan — Vista interactiva de niveles y departamentos.
 * - Tabs por nivel con imagen de plano
 * - Lista de departamentos con hover highlight
 * - Click abre modal con detalle + boton "Separar"
 */
const InteractiveFloorPlan = ({ niveles = [], project = null }) => {
  const [activeLevel, setActiveLevel] = useState(0);
  const [hoveredDept, setHoveredDept] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const { openSeparationModal } = useUIStore();

  if (!niveles.length) return null;

  const currentLevel = niveles[activeLevel];
  const departments = currentLevel?.departamentos || [];

  const handleSeparar = (dept) => {
    setSelectedDept(null);
    openSeparationModal(dept, project);
  };

  return (
    <Wrapper>
      {/* Tabs de niveles */}
      <LevelTabs>
        {niveles.map((nivel, idx) => (
          <LevelTab
            key={nivel.id}
            $active={activeLevel === idx}
            onClick={() => setActiveLevel(idx)}
          >
            {nivel.nombre || `Nivel ${nivel.numero}`}
          </LevelTab>
        ))}
      </LevelTabs>

      <Content>
        {/* Plano de planta */}
        <PlanColumn>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLevel?.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentLevel?.imagen_planta ? (
                <PlanImage
                  src={currentLevel.imagen_planta}
                  alt={`Plano ${currentLevel.nombre || `Nivel ${currentLevel.numero}`}`}
                  draggable={false}
                />
              ) : (
                <PlanPlaceholder>
                  <PlaceholderText>
                    Plano de planta no disponible para este nivel.
                    <br />
                    Sera subido proximamente desde el panel admin.
                  </PlaceholderText>
                </PlanPlaceholder>
              )}
            </motion.div>
          </AnimatePresence>
        </PlanColumn>

        {/* Lista de departamentos */}
        <DeptColumn>
          <DeptHeader>
            Departamentos - {currentLevel?.nombre || `Nivel ${currentLevel?.numero}`}
          </DeptHeader>

          {departments.length === 0 ? (
            <EmptyMsg>No hay departamentos registrados en este nivel.</EmptyMsg>
          ) : (
            <DeptList>
              {departments.map((dept) => (
                <DeptItem
                  key={dept.id}
                  $active={hoveredDept === dept.id}
                  $status={dept.estado}
                  onMouseEnter={() => setHoveredDept(dept.id)}
                  onMouseLeave={() => setHoveredDept(null)}
                  onClick={() => setSelectedDept(dept)}
                >
                  <DeptCode>{dept.codigo}</DeptCode>
                  <DeptMeta>
                    <DeptType>{dept.tipo_display || dept.tipo}</DeptType>
                    <DeptArea>{formatArea(dept.area_total)}</DeptArea>
                  </DeptMeta>
                  <DeptPrice>
                    {dept.precio ? formatPriceUSD(dept.precio) : 'Consultar'}
                  </DeptPrice>
                  <DeptStatus>
                    <StatusDot $status={dept.estado} />
                    <span>{dept.estado_display || dept.estado}</span>
                  </DeptStatus>
                </DeptItem>
              ))}
            </DeptList>
          )}
        </DeptColumn>
      </Content>

      {/* Modal de detalle del depto */}
      {selectedDept && (
        <Modal
          isOpen={!!selectedDept}
          onClose={() => setSelectedDept(null)}
          title={`Departamento ${selectedDept.codigo}`}
          size="md"
        >
          <ModalBody>
            <Badge status={selectedDept.estado} />

            {selectedDept.imagen_planta && (
              <DeptPlanImage
                src={selectedDept.imagen_planta}
                alt={`Plano Depto ${selectedDept.codigo}`}
              />
            )}

            <DetailsGrid>
              <DetailCard>
                <BedDouble size={16} />
                <div>
                  <DetailLabel>Tipo</DetailLabel>
                  <DetailValue>{selectedDept.tipo_display || selectedDept.tipo}</DetailValue>
                </div>
              </DetailCard>
              <DetailCard>
                <Maximize2 size={16} />
                <div>
                  <DetailLabel>Area total</DetailLabel>
                  <DetailValue>{formatArea(selectedDept.area_total)}</DetailValue>
                </div>
              </DetailCard>
              <DetailCard>
                <Maximize2 size={16} />
                <div>
                  <DetailLabel>Area techada</DetailLabel>
                  <DetailValue>{formatArea(selectedDept.area_techada)}</DetailValue>
                </div>
              </DetailCard>
              <DetailCard>
                <DollarSign size={16} />
                <div>
                  <DetailLabel>Precio</DetailLabel>
                  <DetailValue>{selectedDept.precio ? formatPriceUSD(selectedDept.precio) : 'Consultar'}</DetailValue>
                </div>
              </DetailCard>
            </DetailsGrid>

            {selectedDept.descripcion && (
              <DeptDescription>{selectedDept.descripcion}</DeptDescription>
            )}

            <ModalActions>
              <Button variant="outline" onClick={() => setSelectedDept(null)}>
                Cerrar
              </Button>
              {selectedDept.estado === 'disponible' && (
                <Button variant="primary" onClick={() => handleSeparar(selectedDept)}>
                  <ShoppingCart size={16} />
                  Separar ahora
                </Button>
              )}
            </ModalActions>
          </ModalBody>
        </Modal>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div``;

const LevelTabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
  padding: 4px;
  border: 1px solid ${({ theme }) => theme.glass.border};
  overflow-x: auto;

  &::-webkit-scrollbar { height: 0; }
`;

const LevelTab = styled.button`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.25s ease;

  background: ${({ $active }) =>
    $active ? 'rgba(214,179,112,0.15)' : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.gold : theme.colors.textSecondary};

  &:hover {
    background: ${({ $active }) =>
      $active ? 'rgba(214,179,112,0.15)' : 'rgba(255,255,255,0.04)'};
  }
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};

  ${({ theme }) => theme.media.tablet} {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

const PlanColumn = styled.div`
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.glass.borderGold};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PlanImage = styled.img`
  width: 100%;
  height: auto;
  max-height: 500px;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.radii.lg};
  filter: brightness(0.7);
  transition: filter 0.4s ease, transform 0.4s ease;
  cursor: zoom-in;

  &:hover {
    filter: brightness(1);
    transform: scale(1.03);
  }
`;

const PlanPlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  width: 100%;
`;

const PlaceholderText = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.8;
`;

const DeptColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const DeptHeader = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.eyebrow};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: ${({ theme }) => theme.colors.gold};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const EmptyMsg = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const DeptList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  max-height: 480px;
  overflow-y: auto;

  ${({ theme }) => theme.media.mobile} {
    max-height: 300px;
  }
  padding-right: ${({ theme }) => theme.spacing.xs};

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: rgba(214,179,112,0.3);
    border-radius: 4px;
  }
`;

const statusColors = {
  disponible: 'rgba(74,222,128,0.12)',
  separado: 'rgba(245,158,11,0.12)',
  vendido: 'rgba(239,68,68,0.12)',
};

const statusBorders = {
  disponible: 'rgba(74,222,128,0.25)',
  separado: 'rgba(245,158,11,0.25)',
  vendido: 'rgba(239,68,68,0.25)',
};

const DeptItem = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${({ $active, $status }) =>
    $active ? (statusBorders[$status] || 'rgba(214,179,112,0.4)') : 'rgba(255,255,255,0.06)'};
  background: ${({ $active, $status }) =>
    $active ? (statusColors[$status] || 'rgba(214,179,112,0.06)') : 'rgba(255,255,255,0.02)'};

  &:hover {
    background: rgba(214,179,112,0.06);
    border-color: rgba(214,179,112,0.25);
    transform: translateX(4px);
  }

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: auto 1fr;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const DeptCode = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.white};
  min-width: 50px;
`;

const DeptMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const DeptType = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DeptArea = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const DeptPrice = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gold};

  ${({ theme }) => theme.media.mobile} {
    display: none;
  }
`;

const DeptStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;

  ${({ theme }) => theme.media.mobile} {
    display: none;
  }
`;

const dotColors = {
  disponible: '#4ade80',
  separado: '#f59e0b',
  vendido: '#ef4444',
};

const StatusDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $status }) => dotColors[$status] || '#6b7280'};
  flex-shrink: 0;
`;

/* Modal styles */
const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const DeptPlanImage = styled.img`
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(10,20,40,0.4);
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;

const DetailCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: ${({ theme }) => theme.radii.md};

  svg {
    color: ${({ theme }) => theme.colors.gold};
    opacity: 0.85;
    flex-shrink: 0;
  }
`;

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

const DeptDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 300;
  color: rgba(255,255,255,0.55);
  line-height: 1.75;
`;

const ModalActions = styled.div`
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

export default InteractiveFloorPlan;
