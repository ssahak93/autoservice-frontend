'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useDashboardStatistics } from '@/hooks/useDashboard';

import { AnalyticsCharts } from './AnalyticsCharts';
import { DateRangePicker } from './DateRangePicker';
import { StatisticsCards } from './StatisticsCards';

export function AnalyticsContent() {
  const t = useTranslations('dashboard.analytics');
  const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>({});

  const { data: statistics, isLoading } = useDashboardStatistics(dateRange);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('title', { defaultValue: 'Analytics & Reports' })}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t('description', {
              defaultValue: 'View detailed analytics and insights about your service',
            })}
          </p>
        </div>
        <DateRangePicker
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onChange={(start, end) => setDateRange({ startDate: start, endDate: end })}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600 dark:text-gray-400">
            {t('loading', { defaultValue: 'Loading analytics...' })}
          </div>
        </div>
      ) : statistics ? (
        <>
          <StatisticsCards statistics={statistics} />
          <AnalyticsCharts statistics={statistics} dateRange={dateRange} />
        </>
      ) : (
        <div className="rounded-lg bg-white p-8 text-center dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            {t('noData', { defaultValue: 'No analytics data available' })}
          </p>
        </div>
      )}
    </div>
  );
}
