import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * VisualCalendar — Grid mensual para seleccionar fecha y hora.
 * Horarios: L-V 9am-6pm, Sab 9am-1pm. Domingos y feriados bloqueados.
 *
 * Props:
 * - selectedDate: string (YYYY-MM-DD) o null
 * - selectedTime: string (HH:MM) o null
 * - onSelectDate: (dateStr: string) => void
 * - onSelectTime: (timeStr: string) => void
 */

// Feriados Peru 2026 (dias no laborables)
const HOLIDAYS_2026 = [
  '2026-01-01', '2026-04-02', '2026-04-03', '2026-05-01',
  '2026-06-29', '2026-07-28', '2026-07-29', '2026-08-06',
  '2026-08-30', '2026-10-08', '2026-11-01', '2026-12-08',
  '2026-12-25',
];

const DAY_NAMES = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const VisualCalendar = ({ selectedDate, selectedTime, onSelectDate, onSelectTime }) => {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    // getDay() returns 0=Sun, we want 0=Mon
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const days = [];

    // Padding days from previous month
    for (let i = 0; i < startDay; i++) {
      days.push({ day: null, disabled: true });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const dateStr = formatDateStr(viewYear, viewMonth, d);
      const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      const isSunday = dayOfWeek === 0;
      const isHoliday = HOLIDAYS_2026.includes(dateStr);

      days.push({
        day: d,
        dateStr,
        disabled: isPast || isSunday || isHoliday,
        isSunday,
        isHoliday,
        isSaturday: dayOfWeek === 6,
        isToday: dateStr === formatDateStr(today.getFullYear(), today.getMonth(), today.getDate()),
      });
    }

    return days;
  }, [viewMonth, viewYear, today]);

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

  // Generar horarios segun dia seleccionado
  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];

    const date = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = date.getDay();
    const isSaturday = dayOfWeek === 6;

    const slots = [];
    const startHour = 9;
    const endHour = isSaturday ? 13 : 18;

    for (let h = startHour; h < endHour; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
      if (h < endHour - 1 || !isSaturday) {
        slots.push(`${String(h).padStart(2, '0')}:30`);
      }
    }
    return slots;
  }, [selectedDate]);

  const canGoPrev = viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  return (
    <Wrapper>
      {/* Calendar header */}
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

      {/* Day names */}
      <DayNamesRow>
        {DAY_NAMES.map((name) => (
          <DayName key={name}>{name}</DayName>
        ))}
      </DayNamesRow>

      {/* Calendar grid */}
      <CalendarGrid>
        {calendarDays.map((cell, idx) => (
          <DayCell
            key={idx}
            $disabled={cell.disabled}
            $selected={cell.dateStr === selectedDate}
            $isToday={cell.isToday}
            $isSunday={cell.isSunday}
            $isHoliday={cell.isHoliday}
            onClick={() => {
              if (!cell.disabled && cell.dateStr) {
                onSelectDate(cell.dateStr);
                onSelectTime(null); // Reset time on date change
              }
            }}
          >
            {cell.day}
          </DayCell>
        ))}
      </CalendarGrid>

      {/* Legend */}
      <Legend>
        <LegendItem><LegendDot $color="#4ade80" /> Disponible</LegendItem>
        <LegendItem><LegendDot $color="#ef4444" /> No disponible</LegendItem>
      </Legend>

      {/* Time slots */}
      {selectedDate && (
        <TimeSection>
          <TimeLabel>Selecciona un horario:</TimeLabel>
          <TimeSlotsGrid>
            {timeSlots.map((slot) => (
              <TimeSlot
                key={slot}
                $selected={selectedTime === slot}
                onClick={() => onSelectTime(slot)}
              >
                {slot}
              </TimeSlot>
            ))}
          </TimeSlotsGrid>
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
  gap: ${({ theme }) => theme.spacing.md};
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
  width: 36px;
  height: 36px;
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
  font-size: ${({ theme }) => theme.fontSizes.md};
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
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gold};
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: ${({ theme }) => theme.spacing.xs} 0;

  ${({ theme }) => theme.media.mobile} {
    font-size: 0.65rem;
    letter-spacing: 0.5px;
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
`;

const DayCell = styled.button`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  font-family: ${({ theme }) => theme.fonts.body};
  border: 1.5px solid transparent;
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  transition: all 0.15s ease;
  min-width: 0;
  padding: 0;

  ${({ theme }) => theme.media.mobile} {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    border-radius: 6px;
  }

  background: ${({ $selected, $disabled, $isToday }) => {
    if ($selected) return 'rgba(214,179,112,0.2)';
    if ($disabled) return 'transparent';
    if ($isToday) return 'rgba(74,222,128,0.08)';
    return 'rgba(255,255,255,0.02)';
  }};

  color: ${({ $selected, $disabled, $isSunday, $isHoliday, theme }) => {
    if ($selected) return theme.colors.gold;
    if ($disabled || $isSunday || $isHoliday) return 'rgba(255,255,255,0.15)';
    return 'rgba(255,255,255,0.7)';
  }};

  border-color: ${({ $selected, $isToday }) => {
    if ($selected) return 'rgba(214,179,112,0.5)';
    if ($isToday) return 'rgba(74,222,128,0.3)';
    return 'transparent';
  }};

  &:hover:not(:disabled) {
    ${({ $disabled }) => !$disabled && `
      background: rgba(214,179,112,0.1);
      border-color: rgba(214,179,112,0.3);
      color: rgba(255,255,255,0.9);
    `}
  }

  ${({ $disabled, $isSunday, $isHoliday }) => ($disabled || $isSunday || $isHoliday) && `
    text-decoration: line-through;
  `}
`;

const Legend = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  justify-content: center;
  flex-wrap: wrap;

  ${({ theme }) => theme.media.mobile} {
    gap: ${({ theme }) => theme.spacing.md};
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
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 6px;

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
    gap: 4px;
  }
`;

const TimeSlot = styled.button`
  padding: 8px 4px;
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 500;
  font-family: ${({ theme }) => theme.fonts.body};
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1.5px solid ${({ $selected }) =>
    $selected ? 'rgba(214,179,112,0.5)' : 'rgba(255,255,255,0.08)'};
  background: ${({ $selected }) =>
    $selected ? 'rgba(214,179,112,0.15)' : 'rgba(255,255,255,0.02)'};
  color: ${({ $selected, theme }) =>
    $selected ? theme.colors.gold : 'rgba(255,255,255,0.6)'};

  &:hover {
    background: rgba(214,179,112,0.1);
    border-color: rgba(214,179,112,0.3);
  }
`;

export default VisualCalendar;
