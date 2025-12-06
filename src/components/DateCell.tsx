import { cn } from "@/lib/utils";

export interface DateCellProps {
  date: string;
  remaining: number;
  onSelect: (date: string) => void;
}

export function DateCell({ date, remaining, onSelect }: DateCellProps) {
  const normalizedRemaining = Math.min(Math.max(remaining, 0), 5);
  const booked = 5 - normalizedRemaining;
  const isUnavailable = remaining < 0;
  const isFull = normalizedRemaining <= 0;
  const disabled = isFull || isUnavailable;
  const ariaLabel = isUnavailable
    ? `Date ${date} unavailable`
    : isFull
      ? `Date ${date} full`
      : `Date ${date} available with ${normalizedRemaining} slots left`;

  const mobileLabel = isUnavailable
    ? "Unavailable"
    : isFull
      ? "Full"
      : "Available";

  const desktopLabel = isUnavailable
    ? "Unavailable"
    : isFull
      ? "Full"
      : `Available (${booked}/5 booked)`;

  const handleClick = () => {
    if (disabled) return;
    onSelect(date);
  };

  const dayNumber = new Date(`${date}T12:00:00`).getDate();

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "w-full h-full min-h-[48px] sm:min-h-[150px] rounded-xl sm:rounded-2xl border p-1 sm:p-4 text-left flex flex-col gap-2 sm:gap-3 transition-all duration-200 shadow-sm",
        "bg-card border-border",
        !disabled && "hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        isFull && !isUnavailable && "border-red-200 bg-red-50 text-red-700",
        isUnavailable && "border-border/70 bg-muted/60 text-muted-foreground",
        disabled && "cursor-not-allowed opacity-80"
      )}
    >
      {/* Mobile simplified pill */}
      <div className="sm:hidden flex items-center justify-center w-full h-full">
        <div
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-none text-sm font-semibold border",
            isUnavailable && "bg-muted text-muted-foreground border-border/70",
            isFull && "bg-red-500 text-white border-red-500",
            !isFull && !isUnavailable && "bg-primary text-primary-foreground border-primary"
          )}
        >
          {dayNumber}
        </div>
      </div>

      {/* Desktop/tablet detailed layout */}
      <div className="hidden sm:flex flex-col gap-3 h-full min-w-0">
        <div className="flex items-start justify-between gap-2 min-w-0">
          <span className="text-lg font-semibold leading-none">{dayNumber}</span>
          <span
            className={cn(
              "text-[11px] font-semibold px-2 py-1 rounded-full whitespace-nowrap leading-tight",
              isFull
                ? "bg-red-100 text-red-700"
                : isUnavailable
                  ? "bg-slate-200 text-slate-700"
                  : "bg-emerald-50 text-emerald-700"
            )}
          >
            {mobileLabel}
          </span>
        </div>

        <div className="hidden sm:grid grid-cols-5 gap-1 w-full" aria-label={`${booked} of 5 slots booked`}>
          {Array.from({ length: 5 }).map((_, idx) => {
            const filled = idx < booked;
            return (
              <div
                key={idx}
                className={cn(
                  "h-2 rounded-full transition-colors",
                  filled ? "bg-[#4ade80]" : "bg-[#e5e7eb]"
                )}
              />
            );
          })}
        </div>

        <p
          className={cn(
            "hidden sm:block text-xs font-medium leading-snug break-words",
            isFull ? "text-red-700" : "text-muted-foreground"
          )}
        >
          {desktopLabel}
        </p>
      </div>
    </button>
  );
}
