'use client';

import { Car } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Skeleton } from '@/components/common/Skeleton';
import { useDashboardStatistics } from '@/hooks/useDashboard';
import { getAvatarUrl } from '@/lib/utils/file';
import { useProviderStore } from '@/stores/providerStore';

// Lazy load heavy components
const AnalyticsCharts = dynamic(
  () => import('./AnalyticsCharts').then((mod) => ({ default: mod.AnalyticsCharts })),
  {
    loading: () => (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    ),
    ssr: false,
  }
);

const DateRangePicker = dynamic(
  () => import('./DateRangePicker').then((mod) => ({ default: mod.DateRangePicker })),
  {
    ssr: false,
  }
);

import { StatisticsCards } from './StatisticsCards';

export function AnalyticsContent() {
  const t = useTranslations('dashboard.analytics');
  const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>({});
  const { selectedProviderId, getSelectedProvider } = useProviderStore();

  const selectedProvider = getSelectedProvider();
  const { data: statistics, isLoading } = useDashboardStatistics(dateRange);

  // Get provider name
  const getProviderName = () => {
    if (!selectedProvider) return '';
    if (selectedProvider.serviceType === 'company' && selectedProvider.companyName) {
      return selectedProvider.companyName;
    }
    if (selectedProvider.firstName || selectedProvider.lastName) {
      return `${selectedProvider.firstName || ''} ${selectedProvider.lastName || ''}`.trim();
    }
    return selectedProvider.name || '';
  };

  const providerName = getProviderName();
  const providerAvatar = selectedProvider ? getAvatarUrl(selectedProvider) : null;

  // Show message if no provider is selected
  if (!selectedProviderId) {
    return (
      <div className="space-y-6">
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
        <div className="rounded-lg bg-white p-8 text-center dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            {t('selectService', {
              defaultValue: 'Please select a provider to view analytics',
            })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Provider Avatar and Name */}
          {providerAvatar ? (
            <Image
              src={providerAvatar}
              alt={providerName}
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              <Car className="h-7 w-7" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('title', { defaultValue: 'Analytics & Reports' })}
            </h1>
            {providerName && (
              <p className="mt-1 text-lg font-medium text-primary-600 dark:text-primary-400">
                {providerName}
              </p>
            )}
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {t('description', {
                defaultValue: 'View detailed analytics and insights about your provider',
              })}
            </p>
          </div>
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
