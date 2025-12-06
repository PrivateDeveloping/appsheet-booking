import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateCell } from '@/components/DateCell';
import { DateSlot } from '@/types/booking';
import { cn } from '@/lib/utils';

interface BookingCalendarProps {
  dates: DateSlot[];
  loading: boolean;
  onDateSelect: (date: string) => void;
  selectedDate: string | null;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function BookingCalendar({ dates, loading, onDateSelect, selectedDate }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const datesMap = useMemo(() => {
    const map = new Map<string, DateSlot>();
    dates.forEach(d => map.set(d.date, d));
    return map;
  }, [dates]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: (Date | null)[] = [];
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    
    return days;
  }, [currentMonth]);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Treat today as past to prevent same-day bookings
    return date <= today;
  };

  const getDateDetails = (date: Date) => {
    const dateStr = formatDate(date);
    const slot = datesMap.get(dateStr);
    const isPast = isPastDate(date);

    if (!slot) {
      return { dateStr, remaining: -1, selectable: false };
    }

    const clampedRemaining = Math.max(0, Math.min(slot.remaining, 5));
    const isFull = slot.full || clampedRemaining <= 0;

    if (isPast) {
      return { dateStr, remaining: -1, selectable: false };
    }

    return {
      dateStr,
      remaining: isFull ? 0 : clampedRemaining,
      selectable: !isFull
    };
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateClick = (dateStr: string, selectable: boolean) => {
    if (!selectable) return;
    onDateSelect(dateStr);
  };

  return (
    <div className="bg-card rounded-xl shadow-card p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent rounded-lg">
            <Calendar className="w-5 h-5 text-accent-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}

      {/* Calendar grid */}
      {!loading && (
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {DAYS.map(day => (
            <div key={day} className="text-center py-2 text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dateStr = formatDate(date);
            const { remaining, selectable } = getDateDetails(date);
            const isSelected = selectedDate === dateStr;
            return (
              <div
                key={dateStr}
                className={cn(
                  "aspect-square p-1",
                  isSelected && "ring-2 ring-primary rounded-xl"
                )}
              >
                <DateCell
                  date={dateStr}
                  remaining={remaining}
                  onSelect={(value) => handleDateClick(value, selectable)}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-3 h-1.5 rounded-sm bg-[#4ade80]" />
            ))}
            {[3, 4].map((i) => (
              <div key={i} className="w-3 h-1.5 rounded-sm bg-[#e5e7eb]" />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-red-200 border border-red-300" />
          <span className="text-xs text-muted-foreground">Full</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <span className="text-xs text-muted-foreground">Unavailable</span>
        </div>
      </div>
    </div>
  );
}
