import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styled from 'styled-components';
import { Calendar, CheckCircle, Video, MapPin, Download, ExternalLink, ArrowLeft, ArrowRight } from 'lucide-react';
import { appointmentSchema } from '../schemas/appointmentSchema';
import { Button } from '@/shared/components/ui/Button';
import VisualCalendar from './VisualCalendar';
import PoliticasModal from './PoliticasModal';
import {
  Form, Field, FieldRow, Label, Input, Textarea, Select, ErrorMsg,
} from './ContactForm';
import useConfiguracion from '@/shared/hooks/useConfiguracion';
import { generateIcs, downloadIcs } from '../utils/generateIcs';

/**
 * AppointmentForm — Formulario de cita.
 * Tipos: presencial (oficina) o virtual (Google Meet).
 * Combina fecha + hora en un datetime ISO para el backend.
 *
 * Sprint 2:
 *  - Despues del exito mostramos un resumen sobrio con direccion, link a Maps,
 *    descarga .ics y, si la cita es virtual, el link permanente de Meet.
 *  - El mapa estatico de la pagina se oculta mientras se ve el resumen
 *    (la pagina ContactPage decide eso a partir de appointmentSuccess).
 */
const AppointmentForm = ({ onSubmit, loading, error, success, onReset }) => {
  // Wizard de 2 pasos:
  //   1 = tipo + calendario + slot
  //   2 = datos personales + politicas + submit
  const [step, setStep] = useState(1);
  const [calDate, setCalDate] = useState(null);
  const [calTime, setCalTime] = useState(null);
  const [submitted, setSubmitted] = useState(null);
  const [politicasOpen, setPoliticasOpen] = useState(false);

  const { config } = useConfiguracion();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    trigger,
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { acepta_politicas: false },
  });

  const tipoSeleccionado = watch('tipo');

  // Cuando la cita se agenda con exito, llevamos la vista al inicio para
  // que el resumen de confirmacion aparezca arriba.
  useEffect(() => {
    if (success) {
      requestAnimationFrame(() => {
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      });
    }
  }, [success]);

  // Al cambiar de step, scroll al tope para que el header del wizard se vea.
  useEffect(() => {
    if (step === 2) {
      requestAnimationFrame(() => {
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
          document.documentElement.scrollTop = 0;
        }
      });
    }
  }, [step]);

  const handleDateSelect = (dateStr) => {
    setCalDate(dateStr);
    setValue('fecha_preferida', dateStr, { shouldValidate: true });
  };

  const handleTimeSelect = (timeStr) => {
    setCalTime(timeStr);
    setValue('hora_preferida', timeStr, { shouldValidate: true });
  };

  const handleContinue = () => {
    // Validamos solo con state local (calDate/calTime/tipoSeleccionado) para
    // evitar race conditions entre setValue + register hidden input + trigger.
    // Si los 3 estan llenos, avanzamos directo al paso 2.
    if (!stepOneReady) return;
    // Aseguramos que RHF tenga los valores antes de pasar al paso 2.
    setValue('fecha_preferida', calDate, { shouldValidate: false });
    setValue('hora_preferida', calTime, { shouldValidate: false });
    setStep(2);
  };

  const handleFormSubmit = async (data) => {
    const { fecha_preferida, hora_preferida, acepta_politicas: _ignored, ...rest } = data;
    const payload = {
      ...rest,
      fecha_preferida: `${fecha_preferida}T${hora_preferida}:00-05:00`,
    };
    setSubmitted({ ...rest, fecha: fecha_preferida, hora: hora_preferida });
    await onSubmit(payload);
  };

  if (success && submitted) {
    return (
      <AppointmentSuccess
        data={submitted}
        config={config}
        onReset={() => {
          reset({ acepta_politicas: false });
          setSubmitted(null);
          setCalDate(null);
          setCalTime(null);
          setStep(1);
          onReset();
        }}
      />
    );
  }

  const stepOneReady = !!calDate && !!calTime && !!tipoSeleccionado;

  return (
    <>
      <WizardSteps aria-label="Pasos para agendar cita">
        <WizardStep
          type="button"
          $active={step === 1}
          $done={step > 1}
          onClick={() => setStep(1)}
          aria-label="Volver al paso 1: Fecha y hora"
          title="Volver al paso 1"
        >
          <StepDot>1</StepDot>
          <StepLabel>Fecha y hora</StepLabel>
        </WizardStep>
        <WizardConnector $done={step > 1} />
        <WizardStep
          type="button"
          $active={step === 2}
          $disabled={!stepOneReady}
          onClick={() => stepOneReady && handleContinue()}
          disabled={!stepOneReady}
          aria-label="Ir al paso 2: Tus datos"
        >
          <StepDot>2</StepDot>
          <StepLabel>Tus datos</StepLabel>
        </WizardStep>
      </WizardSteps>

      <Form onSubmit={handleSubmit(handleFormSubmit)}>
        {step === 1 && (
          <>
            <Field>
              <Label htmlFor="apt-tipo">Tipo de cita *</Label>
              <Select id="apt-tipo" {...register('tipo')} $error={!!errors.tipo}>
                <option value="">Selecciona...</option>
                <option value="presencial">Visita presencial (oficina)</option>
                <option value="virtual">Reunión virtual (Google Meet)</option>
              </Select>
              {errors.tipo && <ErrorMsg>{errors.tipo.message}</ErrorMsg>}
              {tipoSeleccionado === 'virtual' && (
                <MeetNote>
                  <Video size={14} />
                  Se enviará un enlace de Google Meet al correo proporcionado.
                </MeetNote>
              )}
            </Field>

            <CalendarWrapper $expanded>
              <Label>Fecha y hora de la cita *</Label>
              {!tipoSeleccionado ? (
                <CalendarHint>
                  Seleccioná primero el tipo de cita para ver los horarios disponibles.
                </CalendarHint>
              ) : (
                <VisualCalendar
                  tipo={tipoSeleccionado}
                  selectedDate={calDate}
                  selectedTime={calTime}
                  onSelectDate={handleDateSelect}
                  onSelectTime={handleTimeSelect}
                />
              )}
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
                  {calDate} a las {format12h(calTime)}
                </SelectedSummary>
              )}
            </CalendarWrapper>

            <SubmitRow>
              <Button
                type="button"
                variant="primary"
                size="lg"
                disabled={!stepOneReady}
                onClick={handleContinue}
              >
                Continuar
                <ArrowRight size={16} />
              </Button>
            </SubmitRow>
          </>
        )}

        {step === 2 && (
          <>
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
                <Label htmlFor="apt-apellido">Apellidos *</Label>
                <Input
                  id="apt-apellido"
                  {...register('apellido')}
                  placeholder="Tus apellidos"
                  $error={!!errors.apellido}
                />
                {errors.apellido && <ErrorMsg>{errors.apellido.message}</ErrorMsg>}
              </Field>
            </FieldRow>

            <FieldRow>
              <Field>
                <Label htmlFor="apt-email">Correo electrónico *</Label>
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
                <Label htmlFor="apt-telefono">Teléfono *</Label>
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
              <Label htmlFor="apt-mensaje">Mensaje adicional</Label>
              <Textarea
                id="apt-mensaje"
                {...register('mensaje')}
                rows={3}
                placeholder="¿Hay algo específico que quieras saber?"
                $error={!!errors.mensaje}
              />
              {errors.mensaje && <ErrorMsg>{errors.mensaje.message}</ErrorMsg>}
            </Field>

            <CheckboxRow>
              <CheckboxInput
                id="apt-politicas"
                type="checkbox"
                {...register('acepta_politicas')}
              />
              <CheckboxLabel htmlFor="apt-politicas">
                Acepto las{' '}
                <PoliticasLink type="button" onClick={() => setPoliticasOpen(true)}>
                  Políticas de Privacidad
                </PoliticasLink>
                .
              </CheckboxLabel>
            </CheckboxRow>
            {errors.acepta_politicas && (
              <ErrorMsg>{errors.acepta_politicas.message}</ErrorMsg>
            )}

            {error && <ErrorAlert>{error}</ErrorAlert>}

            <SubmitRow $space>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => setStep(1)}
              >
                <ArrowLeft size={16} />
                Atrás
              </Button>
              <Button type="submit" variant="primary" loading={loading} size="lg">
                <Calendar size={16} />
                Agendar cita
              </Button>
            </SubmitRow>
          </>
        )}
      </Form>

      <PoliticasModal
        isOpen={politicasOpen}
        onClose={() => setPoliticasOpen(false)}
        htmlContent={config?.politicas_privacidad_html}
      />
    </>
  );
};

/**
 * AppointmentSuccess — Resumen sobrio de la cita confirmada.
 * Reemplaza al estado de exito generico anterior.
 */
const AppointmentSuccess = ({ data, config, onReset }) => {
  const direccion = config?.direccion || 'Puente Bolívar 205, Umacollo, Arequipa';
  const meetLink = config?.meet_link_permanente;

  const friendlyDate = formatFriendlyDate(data.fecha);
  const friendlyTime = format12h(data.hora);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;

  const handleDownloadIcs = () => {
    // Construimos las fechas con la zona horaria de Lima (UTC-5).
    const dtStart = new Date(`${data.fecha}T${data.hora}:00-05:00`);
    const dtEnd = new Date(dtStart.getTime() + 60 * 60 * 1000); // 1 hora
    const summary = data.tipo === 'virtual'
      ? 'Cita virtual con IBYZA'
      : 'Cita presencial con IBYZA';
    const description = data.tipo === 'virtual'
      ? `Reunion virtual con un asesor de IBYZA.${meetLink ? `\nGoogle Meet: ${meetLink}` : ''}`
      : `Visita en oficinas de IBYZA.\nDireccion: ${direccion}`;
    const location = data.tipo === 'virtual' ? (meetLink || 'Google Meet') : direccion;

    const ics = generateIcs({ summary, description, location, dtStart, dtEnd });
    downloadIcs(ics, 'cita-ibyza.ics');
  };

  return (
    <SuccessState>
      <SuccessIcon>
        <CheckCircle size={48} />
      </SuccessIcon>
      <SuccessTitle>¡Cita solicitada!</SuccessTitle>
      <SuccessText>
        Te enviamos los detalles a tu correo. Confirmaremos en breve.
      </SuccessText>

      <SummaryCard>
        <SummaryRow>
          <SummaryIcon><Calendar size={16} /></SummaryIcon>
          <SummaryContent>
            <SummaryKey>Fecha y hora</SummaryKey>
            <SummaryValue>
              {friendlyDate} — {friendlyTime}
            </SummaryValue>
          </SummaryContent>
        </SummaryRow>

        {data.tipo === 'presencial' && (
          <SummaryRow>
            <SummaryIcon><MapPin size={16} /></SummaryIcon>
            <SummaryContent>
              <SummaryKey>Direccion</SummaryKey>
              <SummaryValue>{direccion}</SummaryValue>
            </SummaryContent>
          </SummaryRow>
        )}

        {data.tipo === 'virtual' && meetLink && (
          <SummaryRow>
            <SummaryIcon><Video size={16} /></SummaryIcon>
            <SummaryContent>
              <SummaryKey>Google Meet</SummaryKey>
              <MeetLink href={meetLink} target="_blank" rel="noopener noreferrer">
                {meetLink}
                <ExternalLink size={12} />
              </MeetLink>
            </SummaryContent>
          </SummaryRow>
        )}
      </SummaryCard>

      <ActionsRow>
        {data.tipo === 'presencial' && (
          <Button
            as="a"
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            size="md"
          >
            <MapPin size={16} />
            Ver en Google Maps
          </Button>
        )}

        <Button variant="primary" size="md" onClick={handleDownloadIcs}>
          <Download size={16} />
          Descargar .ics
        </Button>
      </ActionsRow>

      <ResetRow>
        <Button variant="ghost" onClick={onReset}>
          Agendar otra cita
        </Button>
      </ResetRow>
    </SuccessState>
  );
};

// --- Helpers de formato ---

function format12h(hhmm) {
  if (!hhmm) return '';
  const [hStr, mStr] = hhmm.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const suffix = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h = h - 12;
  return `${h}:${m} ${suffix}`;
}

function formatFriendlyDate(yyyyMmDd) {
  if (!yyyyMmDd) return '';
  try {
    const [y, m, d] = yyyyMmDd.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return yyyyMmDd;
  }
}

const CalendarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.lg};
  width: 100%;
  /* En paso 1 dejamos que el calendario ocupe todo el ancho del container
     (no tiene sentido un max-width chiquito si esta es la estrella). */
  ${({ $expanded }) => !$expanded && 'max-width: 420px; margin: 0 auto;'}

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.sm};
    max-width: 100%;
  }
`;

const CalendarHint = styled.p`
  margin: 0;
  padding: ${({ theme }) => theme.spacing.md};
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textMuted};
  font-style: italic;
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
  justify-content: ${({ $space }) => ($space ? 'space-between' : 'flex-end')};
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;

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
  padding: ${({ theme }) => theme.spacing.lg} 0;
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
  margin: 0;
`;

const SuccessText = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 300;
  max-width: 420px;
  line-height: 1.7;
  margin: 0;
`;

const SummaryCard = styled.div`
  width: 100%;
  max-width: 460px;
  background: ${({ theme }) => theme.glass.card};
  border: 1px solid ${({ theme }) => theme.glass.border};
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  text-align: left;
`;

const SummaryRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: flex-start;
`;

const SummaryIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: rgba(214,179,112,0.1);
  border: 1px solid rgba(214,179,112,0.2);
  color: ${({ theme }) => theme.colors.gold};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const SummaryContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const SummaryKey = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.eyebrow};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0 0 4px;
`;

const SummaryValue = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  color: rgba(255,255,255,0.85);
  text-transform: capitalize;
  margin: 0;
  line-height: 1.55;
  word-break: break-word;
`;

const MeetLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.gold};
  text-decoration: none;
  word-break: break-all;

  &:hover { text-decoration: underline; }
`;

const ActionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: center;
`;

const ResetRow = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

// --- Wizard styles ---

const WizardSteps = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const WizardStep = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  opacity: ${({ $active, $done, $disabled }) =>
    $disabled ? 0.35 : ($active || $done ? 1 : 0.6)};
  color: ${({ $active, theme }) => ($active ? theme.colors.gold : theme.colors.textSecondary)};
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  letter-spacing: 0.04em;
  background: transparent;
  border: none;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(214,179,112,0.06);
    opacity: 1;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.gold};
    outline-offset: 2px;
  }
`;

const StepDot = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  background: rgba(214,179,112,0.12);
  border: 1px solid rgba(214,179,112,0.35);
  color: inherit;
`;

const StepLabel = styled.span`
  text-transform: uppercase;
  letter-spacing: 1.5px;

  ${({ theme }) => theme.media.mobile} {
    font-size: 0.7rem;
  }
`;

const WizardConnector = styled.span`
  width: 56px;
  height: 1px;
  background: ${({ $done, theme }) =>
    $done ? theme.colors.gold : 'rgba(255,255,255,0.15)'};

  ${({ theme }) => theme.media.mobile} {
    width: 28px;
  }
`;

// --- Checkbox de politicas ---

const CheckboxRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const CheckboxInput = styled.input`
  margin-top: 4px;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.gold};
`;

const CheckboxLabel = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 300;
  line-height: 1.6;
  cursor: pointer;
`;

const PoliticasLink = styled.button`
  background: transparent;
  border: 0;
  padding: 0;
  margin: 0;
  color: ${({ theme }) => theme.colors.gold};
  font-weight: 600;
  font-size: inherit;
  font-family: inherit;
  text-decoration: underline;
  cursor: pointer;

  &:hover { color: #FFE499; }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.gold};
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

export default AppointmentForm;
