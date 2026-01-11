'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { useDashboardStatistics } from '@/hooks/useDashboard';
import { getAnimationVariants, getTransition } from '@/lib/utils/animations';
import { cn } from '@/lib/utils/cn';

export function DashboardStats() {
  const t = useTranslations('dashboard');
  const { data: stats, isLoading, error } = useDashboardStatistics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-light rounded-lg p-4">
            <div className="mb-2 h-4 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-8 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <ErrorDisplay
        error={error}
        title={t('stats.error', { defaultValue: 'Failed to load statistics' })}
        onRetry={() => {
          // React Query will automatically retry when component remounts or query is refetched
          window.location.reload();
        }}
      />
    );
  }

  const statCards = [
    {
      label: t('stats.total', { defaultValue: 'Total Visits' }),
      value: stats.total,
      icon: '📊',
      color: 'bg-blue-500',
    },
    {
      label: t('stats.pending', { defaultValue: 'Pending' }),
      value: stats.pending,
      icon: '⏳',
      color: 'bg-yellow-500',
    },
    {
      label: t('stats.confirmed', { defaultValue: 'Confirmed' }),
      value: stats.confirmed,
      icon: '✅',
      color: 'bg-green-500',
    },
    {
      label: t('stats.completed', { defaultValue: 'Completed' }),
      value: stats.completed,
      icon: '✔️',
      color: 'bg-emerald-500',
    },
    {
      label: t('stats.cancelled', { defaultValue: 'Cancelled' }),
      value: stats.cancelled,
      icon: '❌',
      color: 'bg-red-500',
    },
    {
      label: t('stats.today', { defaultValue: "Today's Visits" }),
      value: stats.today,
      icon: '📅',
      color: 'bg-purple-500',
    },
  ];

  const variants = getAnimationVariants();
  const transition = getTransition(0.2);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((card, index) => (
        <motion.div
          key={card.label}
          variants={variants.slideUp}
          initial="initial"
          animate="animate"
          transition={{ ...transition, delay: index * 0.05 }}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.label}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            </div>
            <motion.div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full text-2xl',
                card.color
              )}
              whileHover={{ scale: 1.1 }}
              transition={transition}
            >
              {card.icon}
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
