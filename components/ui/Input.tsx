import { CheckCircle2, XCircle } from 'lucide-react';
import { forwardRef, useState } from 'react';

import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
}

/**
 * Input Component
 *
 * Single Responsibility: Handles input field UI with validation states
 * Open/Closed: Can be extended with new validation types
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, success, helperText, required, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="space-y-2">
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
          <input
            ref={ref}
            className={cn(
              'w-full rounded-lg border-2 px-4 py-2.5 pr-10 outline-none transition-all',
              'placeholder:text-neutral-400',
              'focus:ring-2 focus:ring-offset-0',
              error
                ? 'border-error-500 focus:border-error-500 focus:ring-error-200'
                : success
                  ? 'border-success-500 focus:border-success-500 focus:ring-success-200'
                  : isFocused
                    ? 'border-primary-500 focus:border-primary-500 focus:ring-primary-200'
                    : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-200',
              'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500',
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error || helperText ? `${props.id || 'input'}-helper` : undefined}
            {...props}
          />
          {/* Success/Error Icons */}
          {success && !error && (
            <CheckCircle2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-success-500" />
          )}
          {error && (
            <XCircle className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-error-500" />
          )}
        </div>
        {/* Error Message */}
        {error && (
          <p
            id={`${props.id || 'input'}-helper`}
            className="flex items-center gap-1 text-sm text-error-600"
          >
            <XCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </p>
        )}
        {/* Helper Text */}
        {helperText && !error && (
          <p id={`${props.id || 'input'}-helper`} className="text-sm text-neutral-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
