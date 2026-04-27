import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styled from 'styled-components';
import { Calendar, CheckCircle, Video } from 'lucide-react';
import { appointmentSchema } from '../schemas/appointmentSchema';
import { Button } from '@/shared/components/ui/Button';
import VisualCalendar from './VisualCalendar';
import {
  Form, Field, FieldRow, Label, Input, Textarea, Select, ErrorMsg,
} from './ContactForm';

/**
 * AppointmentForm — Formulario de cita.
 * Tipos: presencial (oficina) o virtual (Google Meet).
 * Combina fecha + hora en un datetime ISO para el backend.
 */
const AppointmentForm = ({ onSubmit, loading, error, success, onReset }) => {
  const [calDate, setCalDate] = useState(null);
  const [calTime, setCalTime] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(appointmentSchema),
  });

  const tipoSeleccionado = watch('tipo');

  // Fecha minima: manana
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleDateSelect = (dateStr) => {
    setCalDate(dateStr);
    setValue('fecha_preferida', dateStr, { shouldValidate: true });
  };

  const handleTimeSelect = (timeStr) => {
    setCalTime(timeStr);
    setValue('hora_preferida', timeStr, { shouldValidate: true });
  };

  const handleFormSubmit = async (data) => {
    const { fecha_preferida, hora_preferida, ...rest } = data;
    const payload = {
      ...rest,
      fecha_preferida: `${fecha_preferida}T${hora_preferida}:00-05:00`,
    };
    await onSubmit(payload);
  };

  if (success) {
    return (
      <SuccessState>
        <SuccessIcon>
          <CheckCircle size={48} />
        </SuccessIcon>
        <SuccessTitle>Cita solicitada!</SuccessTitle>
        <SuccessText>
          Hemos recibido tu solicitud. Un asesor confirmara la cita
          {tipoSeleccionado === 'virtual'
            ? ' y te enviara el enlace de Google Meet.'
            : ' en nuestras oficinas.'}
        </SuccessText>
        <Button variant="secondary" onClick={() => { reset(); onReset(); }}>
          Agendar otra cita
        </Button>
      </SuccessState>
    );
  }

  return (
    <Form onSubmit={handleSubmit(handleFormSubmit)}>
      <FieldRow>
        <Field>
          <Label htmlFor="apt-nombre">Nombre *</Label>
          <Input
            id="apt-nombre"
            {...register('nombre')}
            placeholder="Tu nombre"
            $error={!!errors.nombre}
          />
          {errors.nombre && <ErrorMsg>{errors.nombre.message}</ErrorMsg>}
        </Field>

        <Field>
          <Label htmlFor="apt-apellido">Apellido *</Label>
          <Input
            id="apt-apellido"
            {...register('apellido')}
            placeholder="Tu apellido"
            $error={!!errors.apellido}
          />
          {errors.apellido && <ErrorMsg>{errors.apellido.message}</ErrorMsg>}
        </Field>
      </FieldRow>

      <FieldRow>
        <Field>
          <Label htmlFor="apt-email">Correo electronico *</Label>
          <Input
            id="apt-email"
            {...register('email')}
            type="email"
            placeholder="tu@correo.com"
            $error={!!errors.email}
          />
          {errors.email && <ErrorMsg>{errors.email.message}</ErrorMsg>}
        </Field>

        <Field>
          <Label htmlFor="apt-telefono">Telefono *</Label>
          <Input
            id="apt-telefono"
            {...register('telefono')}
            type="tel"
            placeholder="+51 999 999 999"
            $error={!!errors.telefono}
          />
          {errors.telefono && <ErrorMsg>{errors.telefono.message}</ErrorMsg>}
        </Field>
      </FieldRow>

      <Field>
        <Label htmlFor="apt-tipo">Tipo de cita *</Label>
        <Select id="apt-tipo" {...register('tipo')} $error={!!errors.tipo}>
          <option value="">Selecciona...</option>
          <option value="presencial">Visita presencial (oficina)</option>
          <option value="virtual">Reunion virtual (Google Meet)</option>
        </Select>
        {errors.tipo && <ErrorMsg>{errors.tipo.message}</ErrorMsg>}
        {tipoSeleccionado === 'virtual' && (
          <MeetNote>
            <Video size={14} />
            Se enviara un enlace de Google Meet al correo proporcionado.
          </MeetNote>
        )}
      </Field>

      {/* Calendario visual */}
      <CalendarWrapper>
        <Label>Fecha y hora de la cita *</Label>
        <VisualCalendar
          selectedDate={calDate}
          selectedTime={calTime}
          onSelectDate={handleDateSelect}
          onSelectTime={handleTimeSelect}
        />
        {/* Hidden inputs for react-hook-form */}
        <input type="hidden" {...register('fecha_preferida')} />
        <input type="hidden" {...register('hora_preferida')} />
        {errors.fecha_preferida && (
          <ErrorMsg>{errors.fecha_preferida.message}</ErrorMsg>
        )}
        {errors.hora_preferida && (
          <ErrorMsg>{errors.hora_preferida.message}</ErrorMsg>
        )}
        {calDate && calTime && (
          <SelectedSummary>
            <Calendar size={14} />
            {calDate} a las {calTime}
          </SelectedSummary>
        )}
      </CalendarWrapper>

      <Field>
        <Label htmlFor="apt-mensaje">Mensaje adicional</Label>
        <Textarea
          id="apt-mensaje"
          {...register('mensaje')}
          rows={3}
          placeholder="Hay algo especifico que quieras saber?"
          $error={!!errors.mensaje}
        />
        {errors.mensaje && <ErrorMsg>{errors.mensaje.message}</ErrorMsg>}
      </Field>

      {error && <ErrorAlert>{error}</ErrorAlert>}

      <SubmitRow>
        <Button type="submit" variant="primary" loading={loading} size="lg">
          <Calendar size={16} />
          Agendar cita
        </Button>
      </SubmitRow>
    </Form>
  );
};

const CalendarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.lg};

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const SelectedSummary = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gold};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const MeetNote = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.gold};
  margin-top: ${({ theme }) => theme.spacing.xs};
  opacity: 0.8;
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

const SuccessIcon = styled.div`
  color: #4ade80;
  filter: drop-shadow(0 0 12px rgba(74,222,128,0.4));
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

export default AppointmentForm;
