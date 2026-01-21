'use client';

import { Clock, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { forwardRef, useState, useRef, useEffect } from 'react';

import { cn } from '@/lib/utils/cn';

export interface TimePickerProps {
  value?: string;
  onChange: (time: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  min?: string;
  max?: string;
  step?: number;
  availableTimes?: string[]; // Available time slots for selected date
  selectedDate?: Date | null; // Selected date to show available times
}

/**
 * Reusable TimePicker Component
 *
 * A modern, accessible time picker component with consistent styling
 * and behavior across the application.
 * Shows available time slots as clickable buttons when availableTimes is provided.
 */
export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Select time',
      label,
      error,
      required = false,
      disabled = false,
      className,
      id,
      name,
      min: _min,
      max: _max,
      step: _step = 900, // 15 minutes default
      availableTimes = [],
      selectedDate,
    },
    ref
  ) => {
    const t = useTranslations('visits');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    const handleTimeSelect = (time: string) => {
      onChange(time);
      setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange('');
      setIsOpen(false);
    };

    const formatTime = (time: string) => {
      // Convert HH:mm to readable format (e.g., "09:00" -> "9:00 AM")
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    const hasAvailableTimes = availableTimes && availableTimes.length > 0 && selectedDate;

    return (
      <div className="w-full" ref={containerRef}>
        {label && (
          <label htmlFor={id} className="mb-2 block text-sm font-medium text-neutral-700">
            {label} {required && <span className="text-error-500">*</span>}
          </label>
        )}
        <div className="relative">
          {/* Input field */}
          <div
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={cn(
              'relative flex w-full cursor-pointer items-center rounded-lg border-2 border-neutral-300 bg-white px-4 py-2.5 pl-10 pr-10 text-sm text-neutral-900 outline-none transition-colors',
              'hover:border-primary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
              error ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : '',
              disabled ? 'cursor-not-allowed bg-neutral-100 opacity-60' : '',
              !value && 'text-neutral-500',
              className
            )}
          >
            <Clock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <span className={cn('flex-1', !value && 'text-neutral-400')}>
              {value ? formatTime(value) : placeholder}
            </span>
            {value && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                aria-label={t('clear', { defaultValue: 'Clear' })}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Dropdown with available times */}
          {isOpen && !disabled && (
            <div className="absolute z-50 mt-2 w-full rounded-lg border-2 border-neutral-200 bg-white shadow-xl">
              {hasAvailableTimes ? (
                <div className="max-h-64 overflow-y-auto p-2">
                  <div className="mb-2 px-2 text-xs font-medium text-neutral-500">
                    {t('selectAvailableTime', { defaultValue: 'Select available time' })}
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => handleTimeSelect(time)}
                        className={cn(
                          'rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all',
                          'hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700',
                          value === time
                            ? 'border-primary-500 bg-primary-500 text-white hover:bg-primary-600'
                            : 'border-neutral-200 bg-white text-neutral-700'
                        )}
                      >
                        {formatTime(time)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-neutral-500">
                  {selectedDate
                    ? t('noAvailableTimes', {
                        defaultValue:
                          'No available times for this date. This may be a non-working day or all slots are booked.',
                      })
                    : t('selectDateFirst', { defaultValue: 'Please select a date first' })}
                </div>
              )}
            </div>
          )}

          {/* Hidden input for form submission */}
          <input ref={ref} type="hidden" value={value || ''} id={id} name={name} />
        </div>
        {error && <p className="mt-1 text-sm text-error-500">{error}</p>}
        {/* Warning if time is selected but not in available times */}
        {value && selectedDate && availableTimes.length > 0 && !availableTimes.includes(value) && (
          <p className="mt-1 text-sm text-amber-600">
            {t('timeNotAvailable', {
              defaultValue:
                'Selected time may not be available. Please select from available times.',
            })}
          </p>
        )}
      </div>
    );
  }
);

TimePicker.displayName = 'TimePicker';
