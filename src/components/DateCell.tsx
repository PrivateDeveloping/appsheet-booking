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

  const handleClick = () => {
    if (disabled) return;
    onSelect(date);
  };

  const dayNumber = new Date(`${date}T12:00:00`).getDate();

  const statusBase = isUnavailable
    ? "bg-muted/70 border-border/70 text-muted-foreground"
    : isFull
      ? "bg-red-500/20 border-red-500/50 text-red-700"
      : "bg-emerald-500/20 border-emerald-500/40 text-emerald-800";

  const statusHover = isUnavailable
    ? "hover:bg-muted/80"
    : isFull
      ? "hover:bg-red-500/25"
      : "hover:bg-emerald-500/25";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "w-full h-full min-h-[48px] rounded-lg border p-0 flex items-center justify-center transition-all duration-200 shadow-sm text-base font-semibold",
        statusBase,
        !disabled && statusHover,
        !disabled && "hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        disabled && "cursor-not-allowed opacity-80"
      )}
    >
      <span className="leading-none">{dayNumber}</span>
      <span className="sr-only">{ariaLabel}</span>
    </button>
  );
}
