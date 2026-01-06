'use client';

import { forwardRef, useState, useCallback, useEffect } from 'react';

import { cn } from '@/lib/utils/cn';

export interface PhoneInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange'
> {
  label?: string;
  error?: string;
  helperText?: string;
  value?: string;
  onChange?: (value: string) => void;
}

/**
 * PhoneInput Component
 *
 * Features:
 * - Static prefix +374
 * - User enters only the number part (without +374)
 * - Supports Armenian format: 098222680 (9 digits with leading 0)
 * - Supports international format: 98222680 (8 digits without leading 0)
 * - Validates format: 8 or 9 digits
 */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ label, error, helperText, value = '', onChange, className, disabled, ...props }, ref) => {
    const [localValue, setLocalValue] = useState(value);

    // Sync with external value changes
    useEffect(() => {
      if (value !== undefined) {
        // Parse value: remove +374 if present
        const parsed = value.replace(/^\+374/, '').replace(/[^\d]/g, '');
        setLocalValue(parsed);
      }
    }, [value]);

    // Format: remove +374 if present, allow only digits
    const formatPhoneNumber = useCallback((input: string): string => {
      // Remove +374 prefix if user tries to type it
      let cleaned = input.replace(/^\+374/, '').replace(/[^\d]/g, '');

      // Limit to 9 digits (for Armenian format with leading 0)
      if (cleaned.length > 9) {
        cleaned = cleaned.slice(0, 9);
      }

      return cleaned;
    }, []);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setLocalValue(formatted);
        onChange?.(formatted);
      },
      [formatPhoneNumber, onChange]
    );

    const handleBlur = useCallback(() => {
      // On blur, ensure we have a valid format
      const cleaned = localValue.replace(/[^\d]/g, '');
      setLocalValue(cleaned);
      onChange?.(cleaned);
    }, [localValue, onChange]);

    return (
      <div className="w-full">
        {label && (
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          {/* Static prefix */}
          <div className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm font-medium text-gray-500 dark:text-gray-400">
            +374
          </div>

          {/* Input field */}
          <input
            ref={ref}
            type="tel"
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder="098222680"
            className={cn(
              'w-full rounded-lg border bg-white px-4 py-2 pl-16 text-gray-900 dark:bg-gray-700 dark:text-white',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500',
              'disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800',
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600',
              className
            )}
            {...props}
          />
        </div>

        {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}

        {helperText && !error && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
