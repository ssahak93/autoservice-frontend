'use client';

import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';
import {
  getUserFriendlyErrorMessage,
  isNetworkError,
  isServerError,
} from '@/lib/utils/errorHandler';

interface ErrorDisplayProps {
  error: unknown;
  title?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
  className?: string;
}

/**
 * ErrorDisplay Component
 *
 * Displays user-friendly error messages with retry and navigation options
 */
export function ErrorDisplay({
  error,
  title,
  onRetry,
  showHomeButton = false,
  className,
}: ErrorDisplayProps) {
  const t = useTranslations('common');
  const router = useRouter();

  const errorMessage = getUserFriendlyErrorMessage(error);
  const isNetwork = isNetworkError(error);
  const isServer = isServerError(error);

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20 ${className || ''}`}
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="mb-4 h-12 w-12 text-red-600 dark:text-red-400" aria-hidden="true" />

      <h2 className="mb-2 text-xl font-semibold text-red-900 dark:text-red-200">
        {title || t('error', { defaultValue: 'Error' })}
      </h2>

      <p className="mb-6 max-w-md text-sm text-red-800 dark:text-red-300">{errorMessage}</p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <Button
            variant="primary"
            onClick={onRetry}
            className="flex items-center gap-2"
            aria-label={t('retry', { defaultValue: 'Retry' })}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {t('retry', { defaultValue: 'Retry' })}
          </Button>
        )}

        {showHomeButton && (
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
            aria-label={t('goHome', { defaultValue: 'Go to Home' })}
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            {t('goHome', { defaultValue: 'Go to Home' })}
          </Button>
        )}
      </div>

      {(isNetwork || isServer) && (
        <p className="mt-4 text-xs text-red-700 dark:text-red-400">
          {isNetwork
            ? t('networkErrorHint', {
                defaultValue: 'Please check your internet connection',
              })
            : t('serverErrorHint', {
                defaultValue: 'The server is experiencing issues. Please try again later.',
              })}
        </p>
      )}
    </div>
  );
}
