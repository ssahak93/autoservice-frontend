'use client';

import { useTranslations } from 'next-intl';

import { useDashboardStatistics } from '@/hooks/useDashboard';
import { cn } from '@/lib/utils/cn';

export function DashboardStats() {
  const t = useTranslations('dashboard');
  const { data: stats, isLoading, error } = useDashboardStatistics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-200">
        {t('stats.error', { defaultValue: 'Failed to load statistics' })}
      </div>
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

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.label}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            </div>
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full text-2xl',
                card.color
              )}
            >
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
