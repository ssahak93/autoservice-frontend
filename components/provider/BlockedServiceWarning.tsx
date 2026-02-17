'use client';

import { motion } from 'framer-motion';
import { Ban } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { memo } from 'react';

interface BlockedServiceWarningProps {
  blockedReason?: string | null;
}

/**
 * Warning component for blocked services
 * Memoized to prevent unnecessary re-renders
 */
export const BlockedServiceWarning = memo(function BlockedServiceWarning({
  blockedReason,
}: BlockedServiceWarningProps) {
  const t = useTranslations('myService');

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-3 rounded-lg bg-red-50 p-3 dark:bg-red-900/20"
    >
      <div className="flex items-start gap-2">
        <Ban className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
        <div className="flex-1">
          <p className="text-xs font-semibold text-red-800 dark:text-red-300">
            {t('servicesList.blocked', {
              defaultValue: 'This service is blocked',
            })}
          </p>
          {blockedReason && (
            <p className="mt-1 text-xs text-red-700 dark:text-red-400">{blockedReason}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
});
