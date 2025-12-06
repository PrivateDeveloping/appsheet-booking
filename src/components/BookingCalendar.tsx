import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    return date < today;
  };

  const getDateStatus = (date: Date): 'available' | 'booked' | 'past' | 'unknown' => {
    if (isPastDate(date)) return 'past';
    const dateStr = formatDate(date);
    const slot = datesMap.get(dateStr);
    return slot?.status || 'unknown';
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    const status = getDateStatus(date);
    if (status === 'available') {
      onDateSelect(formatDate(date));
    }
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
            const status = getDateStatus(date);
            const isSelected = selectedDate === dateStr;
            const isToday = formatDate(new Date()) === dateStr;

            return (
              <button
                key={dateStr}
                onClick={() => handleDateClick(date)}
                disabled={status !== 'available'}
                className={cn(
                  "aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 relative",
                  // Base states
                  status === 'available' && !isSelected && [
                    "bg-accent text-accent-foreground hover:bg-date-available hover:text-primary-foreground",
                    "cursor-pointer hover:scale-105"
                  ],
                  status === 'booked' && [
                    "bg-date-booked-bg text-date-booked cursor-not-allowed",
                  ],
                  status === 'past' && [
                    "text-date-past cursor-not-allowed",
                  ],
                  status === 'unknown' && [
                    "text-muted-foreground cursor-not-allowed opacity-50",
                  ],
                  // Selected state
                  isSelected && [
                    "bg-primary text-primary-foreground scale-105 shadow-md",
                  ],
                  // Today indicator
                  isToday && !isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-card",
                )}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-accent" />
          <span className="text-xs text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-date-booked-bg" />
          <span className="text-xs text-muted-foreground">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <span className="text-xs text-muted-foreground">Past</span>
        </div>
      </div>
    </div>
  );
}
