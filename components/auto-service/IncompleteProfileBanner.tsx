'use client';

import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/routing';

interface IncompleteProfileBannerProps {
  completeness: number;
  onDismiss?: () => void;
}

export function IncompleteProfileBanner({ completeness, onDismiss }: IncompleteProfileBannerProps) {
  const t = useTranslations('myService.incompleteProfile');
  const dismissedKey = 'incompleteProfileBannerDismissed';
  const [isDismissed, setIsDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const wasDismissed = sessionStorage.getItem(dismissedKey) === 'true';
      setIsDismissed(wasDismissed);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(dismissedKey, 'true');
    }
    onDismiss?.();
  };

  // Don't show if dismissed or completeness is 100%
  if (isDismissed || completeness >= 100) {
    return null;
  }

  // During SSR and before mount, return null to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <motion.div
      suppressHydrationWarning
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6 rounded-xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6 shadow-lg dark:border-amber-800 dark:from-amber-900/20 dark:to-orange-900/20"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            {t('title', { defaultValue: 'Complete Your Auto Service Profile' })}
          </h3>
          <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
            {t('description', {
              defaultValue:
                'Your profile is {completeness}% complete. Complete your profile to attract more customers and improve your visibility.',
              completeness,
            })}
          </p>
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {t('progress', { defaultValue: 'Profile Completion' })}
              </span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {completeness}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completeness}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/my-service">
              <Button variant="primary" size="sm" className="group">
                {t('completeButton', { defaultValue: 'Complete Profile' })}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleDismiss}>
              {t('dismiss', { defaultValue: 'Dismiss' })}
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          aria-label={t('dismiss', { defaultValue: 'Dismiss' })}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
}
