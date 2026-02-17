'use client';

import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { memo } from 'react';

import { getAnimationVariants } from '@/lib/utils/animations';

interface ServicesSummaryProps {
  total: number;
  complete: number;
  incomplete: number;
}

/**
 * Summary card showing service statistics
 * Memoized to prevent unnecessary re-renders
 */
export const ServicesSummary = memo(function ServicesSummary({
  total,
  complete,
  incomplete,
}: ServicesSummaryProps) {
  const t = useTranslations('myService');
  const variants = getAnimationVariants();

  return (
    <motion.div
      variants={variants.slideUp}
      initial="initial"
      animate="animate"
      transition={{ delay: 0.2 }}
      className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {t('servicesList.summary', {
              defaultValue:
                'You have {total} auto service(s): {complete} complete, {incomplete} incomplete',
              total,
              complete,
              incomplete,
            })}
          </p>
        </div>
        <div className="flex gap-4">
          {complete > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 dark:bg-green-900/20">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                {complete} {t('servicesList.complete', { defaultValue: 'Complete' })}
              </span>
            </div>
          )}
          {incomplete > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-900/20">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                {incomplete} {t('servicesList.incomplete', { defaultValue: 'Incomplete' })}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});
