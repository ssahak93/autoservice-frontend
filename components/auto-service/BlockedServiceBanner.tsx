'use client';

import { motion } from 'framer-motion';
import { Ban, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

import { useAuth } from '@/hooks/useAuth';

interface BlockedServiceBannerProps {
  autoServiceId: string;
  blockedReason?: string | null;
  onDismiss?: () => void;
}

export function BlockedServiceBanner({
  autoServiceId,
  blockedReason,
  onDismiss,
}: BlockedServiceBannerProps) {
  const t = useTranslations('myService.blocking');
  const { user } = useAuth();
  const dismissedKey = `blockedServiceBannerDismissed_${autoServiceId}`;
  const [isDismissed, setIsDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const wasDismissed = sessionStorage.getItem(dismissedKey) === 'true';
      setIsDismissed(wasDismissed);
    }
  }, [dismissedKey]);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(dismissedKey, 'true');
    }
    onDismiss?.();
  };

  // Check if this auto service is blocked
  const autoService = user?.autoServices?.find((as) => as.id === autoServiceId);
  const isBlocked = autoService?.isBlocked || false;
  const reason = blockedReason || autoService?.blockedReason;

  // Don't show if not blocked, dismissed, or not mounted
  if (!isBlocked || isDismissed || !mounted) {
    return null;
  }

  return (
    <motion.div
      suppressHydrationWarning
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6 rounded-xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-6 shadow-lg dark:border-red-800 dark:from-red-900/20 dark:to-rose-900/20"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <Ban className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            {t('title', { defaultValue: 'Auto Service Blocked' })}
          </h3>
          <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
            {t('message', {
              defaultValue:
                'Your auto service has been blocked by an administrator. You will not be able to access your auto service features until the block is removed.',
            })}
          </p>
          {reason && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                {t('reasonLabel', { defaultValue: 'Reason for blocking' })}:
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-red-700 dark:text-red-400">
                {reason}
              </p>
            </div>
          )}
          <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
            {t('contactSupport', {
              defaultValue: 'If you believe this is an error, please contact our support team.',
            })}
          </p>
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
