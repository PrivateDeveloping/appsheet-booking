import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { Country } from 'react-phone-number-input';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { getCountryCallingCode } from 'libphonenumber-js';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

type CountrySelectOption = {
  value?: Country | 'ZZ';
  label: string;
  divider?: boolean;
};

type CountrySelectProps = {
  value?: Country;
  onChange: (value?: Country) => void;
  options: CountrySelectOption[];
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value' | 'disabled'>;

const isSameOption = (a?: Country | 'ZZ', b?: Country) => {
  if (a === undefined || a === null || a === 'ZZ') {
    return b === undefined || b === null;
  }
  return a === b;
};

const getCallingCode = (country?: Country | 'ZZ') => {
  if (!country || country === 'ZZ') return '';
  try {
    return `+${getCountryCallingCode(country)}`;
  } catch {
    return '';
  }
};

const getFlag = (country?: Country | 'ZZ') => {
  if (!country || country === 'ZZ') return '🌐';
  try {
    return getUnicodeFlagIcon(country);
  } catch {
    return '🏳️';
  }
};

export function CountrySelect({
  value,
  onChange,
  options,
  disabled,
  readOnly,
  className,
  onFocus,
  onBlur,
  ...buttonProps
}: CountrySelectProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const optionList = useMemo(
    () => options.filter((option) => !option.divider),
    [options]
  );
  const selectedIndex = useMemo(
    () => optionList.findIndex((option) => isSameOption(option.value, value)),
    [optionList, value]
  );
  const [highlightedIndex, setHighlightedIndex] = useState(
    selectedIndex >= 0 ? selectedIndex : 0
  );

  const isDisabled = disabled || readOnly;
  const selectedOption =
    optionList[selectedIndex] ?? optionList[0] ?? { label: 'Select', value: undefined };
  const selectedFlag = getFlag(selectedOption.value);
  const selectedCode = getCallingCode(selectedOption.value);

  useEffect(() => {
    if (!open) return;
    const nextIndex = selectedIndex >= 0 ? selectedIndex : 0;
    setHighlightedIndex(nextIndex);
    const timeout = window.setTimeout(() => {
      const highlighted = listRef.current?.querySelector<HTMLElement>(
        `[data-index="${nextIndex}"]`
      );
      highlighted?.scrollIntoView({ block: 'nearest' });
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [open, selectedIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        open &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open]);

  const moveHighlight = (delta: number) => {
    setHighlightedIndex((current) => {
      if (!optionList.length) return current;
      const next =
        (current === -1 ? 0 : current + delta + optionList.length) % optionList.length;
      const highlighted = listRef.current?.querySelector<HTMLElement>(
        `[data-index="${next}"]`
      );
      highlighted?.scrollIntoView({ block: 'nearest' });
      return next;
    });
  };

  const selectOption = (option: CountrySelectOption) => {
    const nextValue =
      option.value && option.value !== 'ZZ' ? (option.value as Country) : undefined;
    onChange(nextValue);
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isDisabled) return;
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveHighlight(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveHighlight(-1);
        break;
      case 'Home':
        event.preventDefault();
        setHighlightedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setHighlightedIndex(optionList.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (optionList[highlightedIndex]) {
          selectOption(optionList[highlightedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        setOpen(false);
        break;
      default:
        break;
    }
  };

  const handleFocus = (event: React.FocusEvent<HTMLButtonElement>) => {
    onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLButtonElement>) => {
    onBlur?.(event);
    if (
      containerRef.current &&
      event.relatedTarget &&
      !containerRef.current.contains(event.relatedTarget as Node)
    ) {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full min-w-[160px]">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        className={cn(
          'flex w-full items-center justify-between gap-3 rounded-md border border-input bg-background px-3 py-2 text-left text-sm text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-60',
          open && 'ring-2 ring-primary/60',
          className
        )}
        disabled={isDisabled}
        onClick={() => !isDisabled && setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...buttonProps}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="text-lg leading-none">{selectedFlag}</span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate">{selectedOption.label}</span>
            {selectedCode && (
              <span className="text-xs text-muted-foreground">{selectedCode}</span>
            )}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-30 mt-2 max-h-72 overflow-hidden rounded-lg border border-border bg-popover shadow-lg shadow-primary/10">
          <ul
            id={listboxId}
            ref={listRef}
            role="listbox"
            className="max-h-72 overflow-y-auto py-1"
          >
            {optionList.map((option, index) => {
              const isSelected = isSameOption(option.value, value);
              const isHighlighted = highlightedIndex === index;
              const code = getCallingCode(option.value);
              const flag = getFlag(option.value);
              return (
                <li
                  key={option.value || option.label}
                  role="option"
                  aria-selected={isSelected}
                  data-index={index}
                  data-highlighted={isHighlighted || undefined}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition',
                    'hover:bg-primary/5 focus:bg-primary/5',
                    isHighlighted && 'bg-primary/10',
                    isSelected && 'font-semibold text-foreground',
                    !isSelected && 'text-foreground'
                  )}
                  onClick={() => selectOption(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <span className="text-lg leading-none">{flag}</span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{option.label}</span>
                    {code && (
                      <span className="text-xs text-muted-foreground">{code}</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CountrySelect;
