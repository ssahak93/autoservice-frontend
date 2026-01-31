'use client';

import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { useRouter } from '@/i18n/routing';

// Disable static generation for offline page (requires browser APIs)
export const dynamic = 'force-dynamic';
export const runtime = 'edge'; // Use edge runtime to avoid SSR issues

export default function OfflinePage() {
  const t = useTranslations('offline');
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const handleRetry = () => {
    if (isOnline) {
      router.refresh();
    } else {
      // Show message that still offline
      alert(
        t('stillOffline', {
          defaultValue: 'You are still offline. Please check your internet connection.',
        })
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-subtle p-4">
      <div className="glass-light w-full max-w-md rounded-2xl p-8 text-center">
        <WifiOff className="mx-auto mb-4 h-16 w-16 text-neutral-400" aria-hidden="true" />
        <h1 className="mb-2 text-2xl font-bold text-neutral-900 dark:text-white">
          {t('title', { defaultValue: 'You are offline' })}
        </h1>
        <p className="mb-6 text-neutral-600 dark:text-neutral-400">
          {t('description', {
            defaultValue:
              'It looks like you are not connected to the internet. Please check your connection and try again.',
          })}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={handleRetry}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t('retry', { defaultValue: 'Try Again' })}
          </Button>
          <Button
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            {t('goHome', { defaultValue: 'Go Home' })}
          </Button>
        </div>
      </div>
    </div>
  );
}
