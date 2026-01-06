'use client';

import { useTranslations } from 'next-intl';

import type { DashboardStatistics } from '@/hooks/useDashboard';

interface AnalyticsChartsProps {
  statistics: DashboardStatistics;
  dateRange: { startDate?: string; endDate?: string };
}

export function AnalyticsCharts({ statistics, dateRange: _dateRange }: AnalyticsChartsProps) {
  const t = useTranslations('dashboard.analytics');

  // Calculate percentages for pie chart
  const total = statistics.total || 1;
  const statusDistribution = [
    {
      label: t('status.pending', { defaultValue: 'Pending' }),
      value: statistics.pending,
      percentage: ((statistics.pending / total) * 100).toFixed(1),
      color: 'bg-yellow-500',
    },
    {
      label: t('status.confirmed', { defaultValue: 'Confirmed' }),
      value: statistics.confirmed,
      percentage: ((statistics.confirmed / total) * 100).toFixed(1),
      color: 'bg-green-500',
    },
    {
      label: t('status.completed', { defaultValue: 'Completed' }),
      value: statistics.completed,
      percentage: ((statistics.completed / total) * 100).toFixed(1),
      color: 'bg-emerald-500',
    },
    {
      label: t('status.cancelled', { defaultValue: 'Cancelled' }),
      value: statistics.cancelled,
      percentage: ((statistics.cancelled / total) * 100).toFixed(1),
      color: 'bg-red-500',
    },
  ].filter((item) => item.value > 0);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Status Distribution Chart */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {t('charts.statusDistribution', { defaultValue: 'Visit Status Distribution' })}
        </h3>
        <div className="space-y-4">
          {statusDistribution.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.value} ({item.percentage}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={`h-full ${item.color} transition-all`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {t('charts.summary', { defaultValue: 'Summary' })}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('summary.completionRate', { defaultValue: 'Completion Rate' })}
            </span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {total > 0 ? ((statistics.completed / total) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('summary.confirmationRate', { defaultValue: 'Confirmation Rate' })}
            </span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {total > 0 ? ((statistics.confirmed / total) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('summary.cancellationRate', { defaultValue: 'Cancellation Rate' })}
            </span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {total > 0 ? ((statistics.cancelled / total) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
