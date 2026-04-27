import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { contactSchema } from '../schemas/contactSchema';
import { Button } from '@/shared/components/ui/Button';

/**
 * ContactForm — Formulario de contacto general. ADN inconsarq inputs glass.
 *
 * Props:
 * - onSubmit: (data) => Promise<void>
 * - loading: boolean
 * - error: string | null
 * - success: boolean
 * - onReset: () => void
 * - projects: array de proyectos (para el select de proyecto de interés)
 */
const ContactForm = ({ onSubmit, loading, error, success, onReset, projects = [] }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(contactSchema),
  });

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    // reset() se llama solo cuando el usuario ve el estado de exito y clickea "Enviar otro"
  };

  if (success) {
    return (
      <SuccessState
        as={motion.div}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <SuccessIconWrapper
          as={motion.div}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        >
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <motion.circle
              cx="32" cy="32" r="30"
              stroke="#4ade80"
              strokeWidth="2.5"
              fill="rgba(74,222,128,0.08)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
            />
            <motion.path
              d="M20 32L28 40L44 24"
              stroke="#4ade80"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.6 }}
            />
          </svg>
        </SuccessIconWrapper>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          <SuccessTitle>¡Mensaje enviado!</SuccessTitle>
          <SuccessText>
            Gracias por contactarnos. Un asesor se comunicará contigo en las próximas horas.
          </SuccessText>
          <Button variant="secondary" onClick={() => { reset(); onReset(); }}>
            Enviar otro mensaje
          </Button>
        </motion.div>
      </SuccessState>
    );
  }

  return (
    <Form onSubmit={handleSubmit(handleFormSubmit)}>
      <FieldRow>
        <Field>
          <Label htmlFor="contact-nombre">Nombre *</Label>
          <Input
            id="contact-nombre"
            {...register('nombre')}
            placeholder="Tu nombre"
            $error={!!errors.nombre}
          />
          {errors.nombre && <ErrorMsg>{errors.nombre.message}</ErrorMsg>}
        </Field>

        <Field>
          <Label htmlFor="contact-apellido">Apellido *</Label>
          <Input
            id="contact-apellido"
            {...register('apellido')}
            placeholder="Tu apellido"
            $error={!!errors.apellido}
          />
          {errors.apellido && <ErrorMsg>{errors.apellido.message}</ErrorMsg>}
        </Field>
      </FieldRow>

      <FieldRow>
        <Field>
          <Label htmlFor="contact-email">Correo electrónico *</Label>
          <Input
            id="contact-email"
            {...register('email')}
            type="email"
            placeholder="tu@correo.com"
            $error={!!errors.email}
          />
          {errors.email && <ErrorMsg>{errors.email.message}</ErrorMsg>}
        </Field>

        <Field>
          <Label htmlFor="contact-telefono">Teléfono *</Label>
          <Input
            id="contact-telefono"
            {...register('telefono')}
            type="tel"
            placeholder="+51 999 999 999"
            $error={!!errors.telefono}
          />
          {errors.telefono && <ErrorMsg>{errors.telefono.message}</ErrorMsg>}
        </Field>
      </FieldRow>

      {(() => {
        const proyectosDisponibles = projects.filter((p) => p.estado !== 'vendido');
        return proyectosDisponibles.length > 0 && (
          <Field>
            <Label htmlFor="contact-proyecto">Proyecto de interés</Label>
            <Select id="contact-proyecto" {...register('proyecto_interes')}>
              <option value="">Sin preferencia</option>
              {proyectosDisponibles.map((p) => (
                <option key={p.id} value={p.slug}>
                  {p.nombre}
                </option>
              ))}
            </Select>
          </Field>
        );
      })()}

      <Field>
        <Label htmlFor="contact-mensaje">Mensaje *</Label>
        <Textarea
          id="contact-mensaje"
          {...register('mensaje')}
          rows={5}
          placeholder="¿En qué podemos ayudarte?"
          $error={!!errors.mensaje}
        />
        {errors.mensaje && <ErrorMsg>{errors.mensaje.message}</ErrorMsg>}
      </Field>

      {error && <ErrorAlert>{error}</ErrorAlert>}

      <SubmitRow>
        <Button type="submit" variant="primary" loading={loading} size="lg">
          <Send size={16} />
          Enviar mensaje
        </Button>
      </SubmitRow>
    </Form>
  );
};

// --- Estilos glass compartidos (exportados para AppointmentForm) ---
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};

  ${({ theme }) => theme.media.mobile} {
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

export const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  ${({ theme }) => theme.media.tablet} {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  letter-spacing: 0.02em;
`;

export const Input = styled.input`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid ${({ $error }) =>
    $error ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.1)'};
  font-size: 16px; /* 16px+ evita zoom auto en iOS */
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.white};
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(8px);
  width: 100%;
  min-width: 0;
  transition: border-color ${({ theme }) => theme.transitions.fast},
    background ${({ theme }) => theme.transitions.fast};

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

export const Select = styled.select`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid rgba(255,255,255,0.1);
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  width: 100%;
  min-width: 0;

  option {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }

  &:focus {
    outline: none;
    border-color: rgba(214,179,112,0.5);
    box-shadow: 0 0 0 3px rgba(214,179,112,0.08);
  }
`;

export const Textarea = styled.textarea`
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1.5px solid ${({ $error }) =>
    $error ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.1)'};
  font-size: 16px;
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.white};
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(8px);
  resize: vertical;
  min-height: 120px;
  line-height: 1.85;
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

export const ErrorMsg = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: #f87171;
`;

const ErrorAlert = styled.div`
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 300;
  color: #f87171;
`;

const SubmitRow = styled.div`
  display: flex;
  justify-content: flex-end;

  ${({ theme }) => theme.media.mobile} {
    justify-content: stretch;

    & > * { flex: 1; }
  }
`;

const SuccessState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl} 0;
`;

const SuccessIconWrapper = styled.div`
  filter: drop-shadow(0 0 16px rgba(74,222,128,0.4));
`;

const SuccessTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: 900;
  letter-spacing: -1px;
  color: ${({ theme }) => theme.colors.white};
`;

const SuccessText = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 300;
  max-width: 400px;
  line-height: 1.85;
`;

export default ContactForm;
