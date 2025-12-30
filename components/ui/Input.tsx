import { forwardRef } from 'react';

import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && <label className="block text-sm font-medium text-neutral-700">{label}</label>}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-lg border-2 px-4 py-2 outline-none transition-colors',
            'focus:border-primary-500',
            error ? 'border-error-500' : 'border-neutral-300',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-error-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
