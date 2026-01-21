'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/routing';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const t = useTranslations('errors');
  const tNav = useTranslations('navigation');

  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="text-center">
        <div className="mb-6">
          <h1 className="mb-2 font-display text-6xl font-bold text-error-600 sm:text-8xl">500</h1>
          <h2 className="mb-4 font-display text-2xl font-semibold text-neutral-900 sm:text-3xl">
            {t('serverError', { defaultValue: 'Server Error' })}
          </h2>
        </div>
        <p className="mb-8 max-w-md text-lg text-neutral-600">
          {t('serverErrorDescription', {
            defaultValue: 'Something went wrong on our end. Please try again later.',
          })}
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" onClick={reset}>
            {t('tryAgain', { defaultValue: 'Try Again' })}
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg">
              {tNav('home')}
            </Button>
          </Link>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 max-w-2xl text-left">
            <summary className="cursor-pointer text-sm font-medium text-neutral-500">
              {t('errorDetails', { defaultValue: 'Error Details' })} (Development Only)
            </summary>
            <pre className="mt-4 overflow-auto rounded-lg bg-neutral-100 p-4 text-xs text-neutral-800">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
