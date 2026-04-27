import styled from 'styled-components';
import { Filter, X } from 'lucide-react';
import useProjectStore from '@/shared/stores/useProjectStore';

/**
 * FilterBar — Filtros para proyectos.
 * Filtra por ESTADO del proyecto (no por tipo de departamento).
 * Estados reales: en_venta, preventa, vendido.
 */
const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'en_venta', label: 'En venta' },
  { value: 'preventa', label: 'Preventa' },
  { value: 'vendido', label: 'Vendido' },
];

export const FilterBar = () => {
  const { filters, setFilter, clearFilters } = useProjectStore();
  const hasActiveFilters = !!filters.estado;

  return (
    <FilterWrapper>
      <FilterIcon>
        <Filter size={16} />
        <span>Filtrar</span>
      </FilterIcon>

      <FilterGroup>
        <FilterLabel>Estado:</FilterLabel>
        <ChipGroup>
          {ESTADOS.map((opt) => (
            <FilterChip
              key={opt.value}
              $active={filters.estado === opt.value}
              onClick={() => setFilter('estado', opt.value)}
            >
              {opt.label}
            </FilterChip>
          ))}
        </ChipGroup>
      </FilterGroup>

      {hasActiveFilters && (
        <ClearButton onClick={clearFilters} title="Limpiar filtros">
          <X size={14} />
          Limpiar
        </ClearButton>
      )}
    </FilterWrapper>
  );
};

const FilterWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.glass.border};
  border-radius: 14px;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.glass.shadow};

  ${({ theme }) => theme.media.mobile} {
    gap: ${({ theme }) => theme.spacing.sm};
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const FilterIcon = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.eyebrow};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: ${({ theme }) => theme.colors.gold};
  flex-shrink: 0;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const FilterLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 400;
  white-space: nowrap;
`;

const ChipGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const FilterChip = styled.button`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1.5px solid;

  background: ${({ $active }) =>
    $active ? 'rgba(214,179,112,0.15)' : 'rgba(255,255,255,0.03)'};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.gold : theme.colors.textSecondary};
  border-color: ${({ $active, theme }) =>
    $active ? theme.colors.borderGold : theme.glass.border};
  box-shadow: ${({ $active }) =>
    $active ? '0 0 12px rgba(214,179,112,0.15)' : 'none'};

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderGold};
    color: ${({ theme }) => theme.colors.gold};
    background: rgba(214,179,112,0.08);
    transform: translateY(-1px);
  }
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  color: rgba(248,113,113,0.8);
  cursor: pointer;
  margin-left: auto;
  transition: opacity ${({ theme }) => theme.transitions.fast};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid rgba(248,113,113,0.2);
  background: rgba(239,68,68,0.05);

  &:hover {
    opacity: 0.8;
    background: rgba(239,68,68,0.1);
  }

  ${({ theme }) => theme.media.mobile} {
    margin-left: 0;
  }
`;

export default FilterBar;
