'use client';

import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';

interface ErrorBoundaryContentProps {
  error: Error | null;
  onReset: () => void;
}

export function ErrorBoundaryContent({ error, onReset }: ErrorBoundaryContentProps) {
  const t = useTranslations('errorBoundary');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-subtle p-4">
      <div className="glass-light w-full max-w-md rounded-2xl p-8 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-error-500" />
        <h2 className="mb-2 font-display text-2xl font-bold text-neutral-900">
          {t('somethingWentWrong')}
        </h2>
        <p className="mb-6 text-neutral-600">
          {error?.message || t('unexpectedError')}
        </p>
        <div className="flex gap-3">
          <Button onClick={onReset} variant="outline">
            {t('tryAgain')}
          </Button>
          <Button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/';
              }
            }}
          >
            {t('goHome')}
          </Button>
        </div>
      </div>
    </div>
  );
}

