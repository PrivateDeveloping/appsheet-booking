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

  const label = isUnavailable
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
      className={cn(
        "w-full h-full rounded-xl border p-2.5 sm:p-4 text-left flex flex-col gap-1.5 sm:gap-2 transition-all duration-200 shadow-sm",
        "bg-card border-border",
        !disabled && "hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        isFull && !isUnavailable && "border-red-200 bg-red-50 text-red-700",
        isUnavailable && "border-border/70 bg-muted/60 text-muted-foreground",
        disabled && "cursor-not-allowed opacity-80"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-base sm:text-lg font-semibold leading-none">{dayNumber}</span>
        <span
          className={cn(
            "text-[11px] sm:text-xs font-semibold px-2 py-1 rounded-full",
            isFull
              ? "bg-red-100 text-red-700"
              : isUnavailable
                ? "bg-slate-200 text-slate-700"
                : "bg-emerald-50 text-emerald-700"
          )}
        >
          {isFull ? "Full" : isUnavailable ? "N/A" : `${normalizedRemaining} left`}
        </span>
      </div>

      <div className="flex gap-1" aria-label={`${booked} of 5 slots booked`}>
        {Array.from({ length: 5 }).map((_, idx) => {
          const filled = idx < booked;
          return (
            <div
              key={idx}
              className={cn(
                "h-2 sm:h-2.5 flex-1 rounded-md transition-colors",
                filled ? "bg-[#4ade80]" : "bg-[#e5e7eb]"
              )}
            />
          );
        })}
      </div>

      <p
        className={cn(
          "text-[11px] sm:text-xs font-medium leading-tight",
          isFull ? "text-red-700" : "text-muted-foreground"
        )}
      >
        {label}
      </p>
    </button>
  );
}
