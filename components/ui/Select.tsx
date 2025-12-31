'use client';

import { ChevronDown, XCircle } from 'lucide-react';
import { SelectHTMLAttributes, forwardRef, useState } from 'react';

import { cn } from '@/lib/utils/cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string; disabled?: boolean; key?: string }>;
}

/**
 * Select Component
 *
 * Single Responsibility: Handles select dropdown UI with validation states
 * Open/Closed: Can be extended with new features without modifying core
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, required, options, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            className={cn(
              'block text-sm font-medium text-neutral-700',
              required && "after:ml-1 after:text-error-500 after:content-['*']"
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'w-full appearance-none rounded-lg border-2 bg-white px-4 py-2.5 pr-10 text-sm',
              'transition-all',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              error
                ? 'border-error-500 focus:border-error-500 focus:ring-error-200'
                : isFocused
                  ? 'border-primary-500 focus:border-primary-500 focus:ring-primary-200'
                  : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-200',
              'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500',
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error || helperText ? `${props.id || 'select'}-helper` : undefined}
            {...props}
          >
            {options.map((option, index) => (
              <option
                key={option.key || `${option.value}-${index}`}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          {/* Dropdown Icon */}
          <ChevronDown
            className={cn(
              'pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400 transition-transform',
              isFocused && 'rotate-180'
            )}
            aria-hidden="true"
          />
          {/* Error Icon */}
          {error && (
            <XCircle className="absolute right-8 top-1/2 h-5 w-5 -translate-y-1/2 text-error-500" />
          )}
        </div>
        {/* Error Message */}
        {error && (
          <p
            id={`${props.id || 'select'}-helper`}
            className="flex items-center gap-1 text-sm text-error-600"
          >
            <XCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </p>
        )}
        {/* Helper Text */}
        {helperText && !error && (
          <p id={`${props.id || 'select'}-helper`} className="text-sm text-neutral-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
