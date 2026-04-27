import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styled from 'styled-components';
import { separationSchema } from '../schemas/separationSchema';
import { Button } from '@/shared/components/ui/Button';
import { formatPriceUSD } from '@/shared/utils/formatters';

/**
 * SeparationForm — Formulario de datos del comprador (Paso 1). ADN inconsarq glass.
 *
 * Props:
 * - department: objeto del departamento a separar
 * - onSubmit: (data) => void
 * - onCancel: () => void
 */
const SeparationForm = ({ department, onSubmit, onCancel }) => {
  const MONTO_SEPARACION = department?.monto_separacion || 500;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(separationSchema),
    defaultValues: {
      monto: MONTO_SEPARACION,
    },
  });

  const handleFormSubmit = (data) => {
    onSubmit({ ...data, monto: MONTO_SEPARACION });
  };

  return (
    <FormWrapper onSubmit={handleSubmit(handleFormSubmit)}>
      {/* Resumen del departamento */}
      <DeptSummary>
        <SummaryTitle>— Departamento a separar —</SummaryTitle>
        <SummaryRow>
          <SummaryKey>Código</SummaryKey>
          <SummaryValue>{department?.codigo || '—'}</SummaryValue>
        </SummaryRow>
        <SummaryRow>
          <SummaryKey>Tipo</SummaryKey>
          <SummaryValue>{department?.tipo || '—'}</SummaryValue>
        </SummaryRow>
        <SummaryRow $highlight>
          <SummaryKey>Monto de separación</SummaryKey>
          <SummaryValue $gold>{formatPriceUSD(MONTO_SEPARACION)}</SummaryValue>
        </SummaryRow>
      </DeptSummary>

      {/* Campos del comprador */}
      <FieldsGrid>
        <Field>
          <Label>Nombre *</Label>
          <Input
            {...register('nombre')}
            placeholder="Tu nombre"
            $error={!!errors.nombre}
          />
          {errors.nombre && <ErrorMsg>{errors.nombre.message}</ErrorMsg>}
        </Field>

        <Field>
          <Label>Apellido *</Label>
          <Input
            {...register('apellido')}
            placeholder="Tu apellido"
            $error={!!errors.apellido}
          />
          {errors.apellido && <ErrorMsg>{errors.apellido.message}</ErrorMsg>}
        </Field>

        <Field>
          <Label>Correo electrónico *</Label>
          <Input
            {...register('email')}
            type="email"
            placeholder="tu@correo.com"
            $error={!!errors.email}
          />
          {errors.email && <ErrorMsg>{errors.email.message}</ErrorMsg>}
        </Field>

        <Field>
          <Label>Teléfono *</Label>
          <Input
            {...register('telefono')}
            type="tel"
            placeholder="+51 999 999 999"
            $error={!!errors.telefono}
          />
          {errors.telefono && <ErrorMsg>{errors.telefono.message}</ErrorMsg>}
        </Field>

        <Field $fullWidth>
          <Label>DNI / Documento de identidad *</Label>
          <Input
            {...register('dni')}
            placeholder="12345678"
            maxLength={12}
            $error={!!errors.dni}
          />
          {errors.dni && <ErrorMsg>{errors.dni.message}</ErrorMsg>}
        </Field>
      </FieldsGrid>

      <Disclaimer>
        Al continuar, aceptas nuestros términos y condiciones de separación.
        El monto de separación no es reembolsable en caso de desistimiento.
      </Disclaimer>

      <Actions>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          Continuar al pago
        </Button>
      </Actions>
    </FormWrapper>
  );
};

const FormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const DeptSummary = styled.div`
  background: rgba(214,179,112,0.05);
  border: 1px solid rgba(214,179,112,0.2);
  border-radius: 14px;
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SummaryTitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.eyebrow};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: ${({ theme }) => theme.colors.gold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ $highlight, theme }) => $highlight ? `${theme.spacing.sm} 0 0 0` : '0'};
  border-top: ${({ $highlight }) => $highlight ? '1px solid rgba(214,179,112,0.15)' : 'none'};
  margin-top: ${({ $highlight, theme }) => $highlight ? theme.spacing.xs : '0'};
`;

const SummaryKey = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SummaryValue = styled.span`
  font-size: ${({ $gold, theme }) => $gold ? theme.fontSizes.lg : theme.fontSizes.sm};
  font-weight: ${({ $gold }) => ($gold ? 700 : 500)};
  color: ${({ theme }) => theme.colors.white};
  ${({ $gold, theme }) => $gold && `
    background: ${theme.gradients.goldText};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  `}
`;

const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  grid-column: ${({ $fullWidth }) => ($fullWidth ? 'span 2' : 'span 1')};

  ${({ theme }) => theme.media.mobile} {
    grid-column: span 1;
  }
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Input = styled.input`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid ${({ $error }) =>
    $error ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.1)'};
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.white};
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(8px);
  width: 100%;
  min-width: 0;
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: rgba(214,179,112,0.5);
    background: rgba(255,255,255,0.06);
    box-shadow: 0 0 0 3px rgba(214,179,112,0.08);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
    font-weight: 300;
  }
`;

const ErrorMsg = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: #f87171;
`;

const Disclaimer = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.85;
  background: rgba(214,179,112,0.04);
  border-left: 2px solid rgba(214,179,112,0.35);
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => `0 ${theme.radii.sm} ${theme.radii.sm} 0`};
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column-reverse;
    & > * { width: 100%; }
  }
`;

export default SeparationForm;
