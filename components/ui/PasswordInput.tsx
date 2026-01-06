'use client';

import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useState } from 'react';

import { Input, InputProps } from '@/components/ui/Input';

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showToggle?: boolean;
}

/**
 * PasswordInput Component
 *
 * Single Responsibility: Handles password input with show/hide toggle functionality
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showToggle = true, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative [&>div>div]:relative">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={showToggle ? 'pr-10' : className}
          {...props}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 z-20 text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            style={{
              top: props.label ? 'calc(1rem + 0.625rem + 0.5rem)' : 'calc(0.625rem + 0.5rem)',
            }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
