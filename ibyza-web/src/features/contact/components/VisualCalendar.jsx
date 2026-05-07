import { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/shared/services/api';

/**
 * VisualCalendar — Grid mensual para seleccionar fecha y hora.
 *
 * La disponibilidad se consulta al backend cuando se elige un dia y depende
 * del tipo de cita (presencial vs virtual):
 *   GET /api/contacto/disponibilidad/?fecha=YYYY-MM-DD&tipo=presencial|virtual
 *   -> { slots: [{ hora, ocupado }], dia_completo_lleno: bool }
 *
 * Tipo de cita:
 *  - presencial: slots cada 30 min L-V 9-13 y 14-18 + Sab 9-13.
 *  - virtual:    solo [12:00, 16:00].
 *
 * Reglas locales (calendario mensual):
 *  - L-V y Sab habilitados; Dom y feriados PE 2026 bloqueados.
 *  - 1 dia minimo de anticipacion.
 *
 * Props:
 *  - tipo            'presencial' | 'virtual' (opcional, default 'virtual')
 *  - selectedDate    string YYYY-MM-DD | null
 *  - selectedTime    string HH:MM      | null
 *  - onSelectDate    (dateStr) => void
 *  - onSelectTime    (timeStr) => void
 */

// Slots de fallback cuando el backend no responde.
const FALLBACK_SLOTS_VIRTUAL = ['12:00', '16:00'];
const FALLBACK_SLOTS_PRESENCIAL = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

// Feriados Peru 2026 (dias no laborables)
const HOLIDAYS_2026 = [
  '2026-01-01', '2026-04-02', '2026-04-03', '2026-05-01',
  '2026-06-29', '2026-07-28', '2026-07-29', '2026-08-06',
  '2026-08-30', '2026-10-08', '2026-11-01', '2026-12-08',
  '2026-12-25',
];

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/**
 * Formatea una hora HH:MM (24h) a un texto amigable 12h:
 *  '12:00' -> '12:00 PM'
 *  '16:00' -> '4:00 PM'
 *  '09:30' -> '9:30 AM'
 */
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

const VisualCalendar = ({ tipo = 'virtual', selectedDate, selectedTime, onSelectDate, onSelectTime }) => {
  const fallbackSlots = tipo === 'presencial'
    ? FALLBACK_SLOTS_PRESENCIAL
    : FALLBACK_SLOTS_VIRTUAL;
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  // Estado de disponibilidad para el dia actualmente seleccionado.
  const [availability, setAvailability] = useState(null); // { slots, dia_completo_lleno }
  const [availLoading, setAvailLoading] = useState(false);
  const [availError, setAvailError] = useState(null);

  // Cache de "dia_completo_lleno" por fecha consultada (para sombrear el calendario).
  const [fullDays, setFullDays] = useState({}); // { 'YYYY-MM-DD': true }

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push({ day: null, disabled: true });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const dateStr = formatDateStr(viewYear, viewMonth, d);
      const dayOfWeek = date.getDay();
      // 1 dia minimo de anticipacion: hoy + 1
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      const isSunday = dayOfWeek === 0;
      const isHoliday = HOLIDAYS_2026.includes(dateStr);
      const isFull = !!fullDays[dateStr];

      days.push({
        day: d,
        dateStr,
        disabled: isPast || isSunday || isHoliday || isFull,
        isSunday,
        isHoliday,
        isFull,
        isSaturday: dayOfWeek === 6,
        isToday: dateStr === formatDateStr(today.getFullYear(), today.getMonth(), today.getDate()),
      });
    }

    return days;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMonth, viewYear, fullDays]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Si cambia el tipo, los slots disponibles cambian: limpiamos la hora
  // previamente seleccionada para que el usuario elija de nuevo en la
  // grilla actualizada.
  useEffect(() => {
    if (selectedTime) onSelectTime(null);
    // Solo reaccionamos al cambio de tipo, no al cambio de selectedTime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo]);

  // Pedir disponibilidad cuando cambia la fecha seleccionada o el tipo.
  useEffect(() => {
    if (!selectedDate) {
      setAvailability(null);
      setAvailError(null);
      return;
    }

    let cancelled = false;
    const fetchDisp = async () => {
      try {
        setAvailLoading(true);
        setAvailError(null);

        const { data } = await api.get('/api/contacto/disponibilidad/', {
          params: { fecha: selectedDate, tipo },
        });

        if (cancelled) return;

        const slots = Array.isArray(data?.slots) && data.slots.length
          ? data.slots
          : fallbackSlots.map((hora) => ({ hora, ocupado: false }));

        setAvailability({
          slots,
          dia_completo_lleno: !!data?.dia_completo_lleno,
        });

        if (data?.dia_completo_lleno) {
          setFullDays((prev) => ({ ...prev, [selectedDate]: true }));
        }
      } catch (err) {
        if (cancelled) return;
        // Fallback: mostrar slots como disponibles si el endpoint falla, asi el flujo no se traba.
        setAvailability({
          slots: fallbackSlots.map((hora) => ({ hora, ocupado: false })),
          dia_completo_lleno: false,
        });
        setAvailError(err.message || 'No se pudo verificar la disponibilidad. Mostramos los slots por defecto.');
      } finally {
        if (!cancelled) setAvailLoading(false);
      }
    };

    fetchDisp();
    return () => { cancelled = true; };
    // fallbackSlots es derivado de tipo, asi que ya esta cubierto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, tipo]);

  const canGoPrev = viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const slotsToRender = availability?.slots
    || fallbackSlots.map((hora) => ({ hora, ocupado: false }));

  return (
    <Wrapper>
      <CalendarHeader>
        <NavButton onClick={prevMonth} disabled={!canGoPrev}>
          <ChevronLeft size={18} />
        </NavButton>
        <MonthLabel>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </MonthLabel>
        <NavButton onClick={nextMonth}>
          <ChevronRight size={18} />
        </NavButton>
      </CalendarHeader>

      <DayNamesRow>
        {DAY_NAMES.map((name) => (
          <DayName key={name}>{name}</DayName>
        ))}
      </DayNamesRow>

      <CalendarGrid>
        {calendarDays.map((cell, idx) => (
          <DayCell
            key={idx}
            $disabled={cell.disabled}
            $selected={cell.dateStr === selectedDate}
            $isToday={cell.isToday}
            $isSunday={cell.isSunday}
            $isHoliday={cell.isHoliday}
            $isFull={cell.isFull}
            onClick={() => {
              if (!cell.disabled && cell.dateStr) {
                onSelectDate(cell.dateStr);
                onSelectTime(null);
              }
            }}
          >
            {cell.day}
          </DayCell>
        ))}
      </CalendarGrid>

      <Legend>
        <LegendItem><LegendDot $color="#4ade80" /> Disponible</LegendItem>
        <LegendItem><LegendDot $color="#ef4444" /> No disponible</LegendItem>
      </Legend>

      {selectedDate && (
        <TimeSection>
          <TimeLabel>
            {availLoading
              ? 'Verificando disponibilidad...'
              : availability?.dia_completo_lleno
                ? 'Sin horarios disponibles para este dia. Probá con otra fecha.'
                : 'Selecciona un horario:'}
          </TimeLabel>

          {!availability?.dia_completo_lleno && (
            <TimeSlotsGrid>
              {slotsToRender.map((slot) => (
                <TimeSlot
                  key={slot.hora}
                  $selected={selectedTime === slot.hora}
                  $occupied={!!slot.ocupado}
                  disabled={!!slot.ocupado || availLoading}
                  onClick={() => {
                    if (slot.ocupado || availLoading) return;
                    onSelectTime(slot.hora);
                  }}
                  type="button"
                >
                  {format12h(slot.hora)}
                </TimeSlot>
              ))}
            </TimeSlotsGrid>
          )}

          {availError && <AvailHint>{availError}</AvailHint>}
        </TimeSection>
      )}
    </Wrapper>
  );
};

function formatDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
  /* Ocupamos todo el ancho del container padre. El padre define el max-width
     (Step 1 del wizard expande, paso embebido lo limita a 420px). */
  margin: 0 auto;
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const NavButton = styled.button`
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.gold};
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: rgba(214,179,112,0.1);
    border-color: rgba(214,179,112,0.3);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const MonthLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.white};
  letter-spacing: 0.02em;
`;

const DayNamesRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
`;

const DayName = styled.span`
  text-align: center;
  font-size: 0.65rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 0;

  ${({ theme }) => theme.media.mobile} {
    font-size: 0.6rem;
    letter-spacing: 0.4px;
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
`;

const DayCell = styled.button`
  /* Celdas cuadradas que escalan con el ancho disponible. En containers
     anchos crecen sin volverse gigantes. */
  aspect-ratio: 1 / 1;
  width: 100%;
  height: auto;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  font-family: ${({ theme }) => theme.fonts.body};
  border: 1.5px solid transparent;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.15s ease;
  min-width: 0;
  padding: 0;

  ${({ theme }) => theme.media.mobile} {
    min-height: 32px;
    font-size: 0.75rem;
    border-radius: 5px;
  }

  background: ${({ $selected, $disabled, $isToday, $isFull }) => {
    if ($isFull) return 'rgba(239,68,68,0.18)';
    if ($selected) return 'rgba(214,179,112,0.2)';
    if ($disabled) return 'transparent';
    if ($isToday) return 'rgba(74,222,128,0.08)';
    return 'rgba(255,255,255,0.02)';
  }};

  color: ${({ $selected, $disabled, $isSunday, $isHoliday, $isFull, theme }) => {
    if ($isFull) return 'rgba(248,113,113,0.85)';
    if ($selected) return theme.colors.gold;
    if ($disabled || $isSunday || $isHoliday) return 'rgba(255,255,255,0.15)';
    return 'rgba(255,255,255,0.7)';
  }};

  border-color: ${({ $selected, $isToday, $isFull }) => {
    if ($isFull) return 'rgba(239,68,68,0.35)';
    if ($selected) return 'rgba(214,179,112,0.5)';
    if ($isToday) return 'rgba(74,222,128,0.3)';
    return 'transparent';
  }};

  &:hover:not(:disabled) {
    ${({ $disabled, $isFull }) => !$disabled && !$isFull && `
      background: rgba(214,179,112,0.1);
      border-color: rgba(214,179,112,0.3);
      color: rgba(255,255,255,0.9);
    `}
  }

  ${({ $disabled, $isSunday, $isHoliday, $isFull }) =>
    ($disabled || $isSunday || $isHoliday) && !$isFull && `
    text-decoration: line-through;
  `}
`;

const Legend = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 4px;

  ${({ theme }) => theme.media.mobile} {
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const LegendItem = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const LegendDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

const TimeSection = styled.div`
  border-top: 1px solid rgba(255,255,255,0.06);
  padding-top: ${({ theme }) => theme.spacing.md};
`;

const TimeLabel = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const TimeSlotsGrid = styled.div`
  display: grid;
  /* Auto-fit segun ancho del container: en presencial hay 16 slots,
     en virtual solo 2. Esto se acomoda solo. */
  grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: repeat(auto-fit, minmax(78px, 1fr));
    gap: 6px;
  }
`;

const TimeSlot = styled.button`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.body};
  cursor: ${({ $occupied }) => ($occupied ? 'not-allowed' : 'pointer')};
  transition: all 0.15s ease;

  border: 1.5px solid ${({ $selected, $occupied }) => {
    if ($occupied) return 'rgba(239,68,68,0.35)';
    if ($selected) return 'rgba(214,179,112,0.5)';
    return 'rgba(255,255,255,0.08)';
  }};

  background: ${({ $selected, $occupied }) => {
    if ($occupied) return 'rgba(239,68,68,0.18)';
    if ($selected) return 'rgba(214,179,112,0.15)';
    return 'rgba(255,255,255,0.02)';
  }};

  color: ${({ $selected, $occupied, theme }) => {
    if ($occupied) return 'rgba(248,113,113,0.85)';
    if ($selected) return theme.colors.gold;
    return 'rgba(255,255,255,0.75)';
  }};

  &:hover:not(:disabled) {
    ${({ $occupied }) => !$occupied && `
      background: rgba(214,179,112,0.1);
      border-color: rgba(214,179,112,0.3);
    `}
  }

  &:disabled { opacity: 0.85; }
`;

const AvailHint = styled.p`
  margin-top: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textMuted};
  font-style: italic;
`;

export default VisualCalendar;
