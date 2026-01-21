'use client';

import { useQuery } from '@tanstack/react-query';
// Import only needed functions from date-fns for tree shaking
import { format } from 'date-fns/format';
// Import only needed locales for tree shaking
import { enUS } from 'date-fns/locale/en-US';
import { hy } from 'date-fns/locale/hy';
import { ru } from 'date-fns/locale/ru';
import { Calendar } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { forwardRef, useMemo, useState, useEffect } from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';

import { availabilityService, type DateLoad } from '@/lib/services/availability.service';
import { cn } from '@/lib/utils/cn';

import 'react-datepicker/dist/react-datepicker.css';

// Register locales for react-datepicker
registerLocale('en', enUS);
registerLocale('ru', ru);
registerLocale('hy', hy);

// Custom input component for date display with month names
interface CustomDateInputProps {
  value?: string;
  onClick?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  selectedDate?: Date | null;
  locale?: string;
}

const CustomDateInput = forwardRef<HTMLInputElement, CustomDateInputProps>(
  ({ value, onClick, placeholder, error, disabled, className, selectedDate, locale }, ref) => {
    // Format the date with month name if we have selectedDate
    const displayValue = useMemo(() => {
      if (!selectedDate) return value || '';

      try {
        switch (locale) {
          case 'ru':
            return format(selectedDate, 'd MMMM yyyy', { locale: ru });
          case 'hy':
            return format(selectedDate, 'd MMMM yyyy', { locale: hy });
          case 'en':
          default:
            return format(selectedDate, 'MMMM d, yyyy', { locale: enUS });
        }
      } catch {
        return value || '';
      }
    }, [selectedDate, locale, value]);

    return (
      <input
        ref={ref}
        readOnly
        value={displayValue}
        onClick={onClick}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-lg border-2 border-neutral-300 bg-white px-4 py-2.5 pl-10 pr-4 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
          error ? 'border-error-500' : '',
          disabled ? 'cursor-not-allowed bg-neutral-100 opacity-60' : 'cursor-pointer',
          className
        )}
      />
    );
  }
);

CustomDateInput.displayName = 'CustomDateInput';

export interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
  dateFormat?: string;
  showTimeSelect?: boolean;
  timeFormat?: string;
  timeIntervals?: number;
  filterDate?: (date: Date) => boolean;
  id?: string;
  name?: string;
  autoServiceId?: string; // For availability checking
  showAvailability?: boolean; // Whether to show availability status
  inline?: boolean; // Whether to show calendar inline (for modals)
  withPortal?: boolean; // Whether to render in portal (for modals)
}

/**
 * Reusable DatePicker Component
 *
 * A modern, accessible date picker component built on react-datepicker
 * with consistent styling and behavior across the application.
 * Supports availability visualization when autoServiceId is provided.
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Select date',
      label,
      error,
      required = false,
      minDate,
      maxDate,
      disabled = false,
      className,
      dateFormat = 'dd/MM/yyyy',
      showTimeSelect = false,
      timeIntervals = 15,
      filterDate,
      id,
      name,
      autoServiceId,
      showAvailability = true,
      inline = false,
      withPortal = false,
    },
    ref
  ) => {
    const t = useTranslations('visits');
    const locale = useLocale();

    // Map locale to react-datepicker locale string
    const datePickerLocale = useMemo(() => {
      switch (locale) {
        case 'ru':
          return 'ru';
        case 'hy':
          return 'hy';
        case 'en':
        default:
          return 'en';
      }
    }, [locale]);

    // Format date for display with month names
    const _formatDisplayDate = (date: Date | null): string => {
      if (!date) return '';
      switch (locale) {
        case 'ru':
          return format(date, 'd MMMM yyyy', { locale: ru }); // "17 января 2026"
        case 'hy':
          return format(date, 'd MMMM yyyy', { locale: hy }); // "17 հունվարի 2026"
        case 'en':
        default:
          return format(date, 'MMMM d, yyyy', { locale: enUS }); // "January 17, 2026"
      }
    };

    // Set default dateFormat for react-datepicker (used internally, not displayed)
    const defaultDateFormat = useMemo(() => {
      switch (locale) {
        case 'ru':
          return 'dd.MM.yyyy';
        case 'hy':
          return 'dd/MM/yyyy';
        case 'en':
        default:
          return 'MM/dd/yyyy';
      }
    }, [locale]);

    // Track if component is mounted to prevent hydration mismatch
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    // Set default minDate to today if not provided (only after mount to prevent hydration mismatch)
    const defaultMinDate = minDate || (showTimeSelect || !isMounted ? undefined : new Date());

    // Calculate date range for availability (next 60 days) - only after mount
    const startDate = useMemo(() => {
      if (!isMounted) return '';
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      return format(date, 'yyyy-MM-dd');
    }, [isMounted]);

    const endDate = useMemo(() => {
      if (!isMounted) return '';
      const date = new Date();
      date.setDate(date.getDate() + 60);
      return format(date, 'yyyy-MM-dd');
    }, [isMounted]);

    // Fetch availability if autoServiceId is provided (only after mount)
    const { data: availability } = useQuery({
      queryKey: ['availability', autoServiceId, startDate, endDate],
      queryFn: () =>
        autoServiceId && showAvailability
          ? availabilityService.getAvailability(autoServiceId, startDate, endDate)
          : null,
      enabled:
        !!autoServiceId && showAvailability && isMounted && startDate !== '' && endDate !== '',
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false, // Don't retry on 404 errors
    });

    // Check if user is trying to book their own service
    const isOwnService = availability === 'OWN_SERVICE';

    // Create a map of date -> load status for quick lookup
    const dateLoadMap = useMemo(() => {
      if (!availability || availability === 'OWN_SERVICE' || !('dateLoad' in availability)) {
        return new Map<string, DateLoad>();
      }
      const map = new Map<string, DateLoad>();
      availability.dateLoad.forEach((load) => {
        map.set(load.date, load);
      });
      return map;
    }, [availability]);

    // Get status for a specific date
    const getDateStatus = (date: Date): DateLoad['status'] | null => {
      if (!showAvailability || !autoServiceId || !availability || availability === 'OWN_SERVICE') {
        return null;
      }
      const dateStr = format(date, 'yyyy-MM-dd');
      return dateLoadMap.get(dateStr)?.status || null;
    };

    // Check if a date is a working day (has available slots)
    const isWorkingDay = (date: Date): boolean => {
      if (!showAvailability || !autoServiceId || !availability || availability === 'OWN_SERVICE') {
        return true; // Allow all dates if availability is not loaded
      }

      const dateStr = format(date, 'yyyy-MM-dd');
      const availableSlot = availability.availableSlots.find((slot) => slot.date === dateStr);
      return !!availableSlot && availableSlot.times.length > 0;
    };

    // Custom filter function to disable non-working days
    const filterWorkingDays = (date: Date): boolean => {
      // Always allow past dates to be filtered by minDate
      if (defaultMinDate && date < defaultMinDate) {
        return false;
      }

      // If availability is loaded, only allow working days
      if (showAvailability && autoServiceId && availability && availability !== 'OWN_SERVICE') {
        return isWorkingDay(date);
      }

      // If availability is not loaded, allow all future dates
      return true;
    };

    // Custom day class name based on availability
    const getDayClassName = (date: Date) => {
      const baseClasses = [];

      // Check if this is the selected date
      const isSelected = value && format(date, 'yyyy-MM-dd') === format(value, 'yyyy-MM-dd');

      if (defaultMinDate && date < defaultMinDate) {
        return '!text-neutral-300 !cursor-not-allowed';
      }

      // Check if this is a non-working day
      if (showAvailability && autoServiceId && availability && availability !== 'OWN_SERVICE') {
        if (!isWorkingDay(date)) {
          return '!text-neutral-300 !cursor-not-allowed !bg-neutral-50';
        }
      }

      // Selected date should always be visible with primary color
      if (isSelected) {
        baseClasses.push('!bg-primary-500 !text-white hover:!bg-primary-600 !font-semibold');
        return baseClasses.join(' ');
      }

      const status = getDateStatus(date);
      if (status === 'full') {
        baseClasses.push('!bg-red-100 !text-red-700 hover:!bg-red-200');
      } else if (status === 'heavy') {
        baseClasses.push('!bg-yellow-100 !text-yellow-700 hover:!bg-yellow-200');
      } else if (status === 'available') {
        baseClasses.push('hover:!bg-primary-100');
      } else {
        baseClasses.push('hover:!bg-primary-100');
      }

      return baseClasses.join(' ');
    };

    // Get selected date status for warning
    const selectedDateStatus = value ? getDateStatus(value) : null;
    const selectedDateLoad = value ? dateLoadMap.get(format(value, 'yyyy-MM-dd')) : null;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="mb-2 block text-sm font-medium text-neutral-700">
            {label} {required && <span className="text-error-500">*</span>}
          </label>
        )}
        <div className="relative">
          <ReactDatePicker
            selected={value}
            onChange={onChange}
            minDate={defaultMinDate}
            maxDate={maxDate}
            disabled={disabled || isOwnService}
            placeholderText={placeholder}
            dateFormat={dateFormat || defaultDateFormat}
            locale={datePickerLocale}
            showTimeSelect={showTimeSelect}
            timeIntervals={timeIntervals}
            filterDate={filterDate || (showAvailability ? filterWorkingDays : undefined)}
            id={id}
            name={name}
            wrapperClassName="w-full"
            calendarClassName="!rounded-lg !border-2 !border-neutral-200 !shadow-xl"
            dayClassName={getDayClassName}
            selectedDayClassName="!bg-primary-500 !text-white hover:!bg-primary-600 !font-semibold"
            inline={inline}
            withPortal={withPortal}
            customInput={
              !inline ? (
                <CustomDateInput
                  value="" // React-datepicker will override this, we use selectedDate instead
                  selectedDate={value}
                  locale={locale}
                  placeholder={placeholder}
                  error={error}
                  disabled={disabled || isOwnService}
                  className={className}
                />
              ) : undefined
            }
            ref={ref as React.LegacyRef<ReactDatePicker>}
          />
          {!inline && (
            <Calendar className="pointer-events-none absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          )}
        </div>

        {/* Own service warning */}
        {isOwnService && (
          <div className="mt-2 rounded-lg border-2 border-blue-300 bg-blue-50 p-3 text-sm text-blue-800">
            <div className="font-semibold">
              ℹ️{' '}
              {t('cannotBookOwnService', {
                defaultValue: 'You cannot book a visit to your own service',
              })}
            </div>
            <div className="mt-1 text-xs">
              {t('useServiceManagementPanel', {
                defaultValue: 'Please use the service management panel to manage your schedule.',
              })}
            </div>
          </div>
        )}

        {/* Availability warning */}
        {selectedDateStatus && selectedDateStatus !== 'available' && selectedDateLoad && (
          <div
            className={cn(
              'mt-2 rounded-lg border-2 p-3 text-sm',
              selectedDateStatus === 'full'
                ? 'border-red-300 bg-red-50 text-red-800'
                : 'border-yellow-300 bg-yellow-50 text-yellow-800'
            )}
          >
            <div className="font-semibold">
              {selectedDateStatus === 'full'
                ? `⚠️ ${t('dayFullyBooked', { defaultValue: 'This day is fully booked' })}`
                : `⚠️ ${t('dayHeavilyBooked', { defaultValue: 'This day is heavily booked' })}`}
            </div>
            <div className="mt-1 text-xs">
              {t('visitsBooked', {
                defaultValue: '{booked} of {max} visits booked ({percentage}% capacity)',
                booked: selectedDateLoad.bookedVisits,
                max: selectedDateLoad.maxVisits,
                percentage: Math.round(selectedDateLoad.loadPercentage),
              })}
            </div>
            <div className="mt-1 text-xs italic">
              {t('canStillBook', {
                defaultValue:
                  'You can still book, but the service may not be able to accommodate your visit.',
              })}
            </div>
          </div>
        )}

        {/* Legend for availability colors */}
        {showAvailability && availability && availability !== 'OWN_SERVICE' && (
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-600">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded border border-green-300 bg-green-100" />
              <span>{t('available', { defaultValue: 'Available' })}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded border border-yellow-300 bg-yellow-100" />
              <span>
                {t('heavy', {
                  defaultValue: 'Heavy ({min}+ visits)',
                  min: Math.floor(availability.maxVisitsPerDay * 0.8),
                })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded border border-red-300 bg-red-100" />
              <span>
                {t('full', {
                  defaultValue: 'Full ({max} visits)',
                  max: availability.maxVisitsPerDay,
                })}
              </span>
            </div>
          </div>
        )}

        {error && <p className="mt-1 text-sm text-error-500">{error}</p>}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
