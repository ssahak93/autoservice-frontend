'use client';

import { motion } from 'framer-motion';
import { Car, User } from 'lucide-react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { ServiceStatusBadge } from '@/components/provider/ServiceStatusBadge';
import { useProviderVisits } from '@/hooks/useDashboard';
import { formatDateShort } from '@/lib/utils/date';
import { getAvatarUrl } from '@/lib/utils/file';
import { formatUserName } from '@/lib/utils/user';

export function RecentVisits() {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const { data, isLoading, error } = useProviderVisits({
    page: 1,
    limit: 10,
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 h-7 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          {t('recentVisits.title', { defaultValue: 'Recent Visits' })}
        </h2>
        <ErrorDisplay
          error={error}
          title={t('recentVisits.error', { defaultValue: 'Failed to load visits' })}
          onRetry={() => {
            // React Query will automatically retry when query is refetched
            window.location.reload();
          }}
        />
      </div>
    );
  }

  const visits = data.data || [];

  if (visits.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          {t('recentVisits.title', { defaultValue: 'Recent Visits' })}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('recentVisits.empty', { defaultValue: 'No visits yet' })}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
        {t('recentVisits.title', { defaultValue: 'Recent Visits' })}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('recentVisits.customer', { defaultValue: 'Customer' })}
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('recentVisits.date', { defaultValue: 'Date' })}
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('recentVisits.time', { defaultValue: 'Time' })}
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('recentVisits.vehicle', { defaultValue: 'Vehicle' })}
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('recentVisits.status', { defaultValue: 'Status' })}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {visits.map((visit, index) => (
              <motion.tr
                key={visit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getAvatarUrl(visit.user) ? (
                      <Image
                        src={getAvatarUrl(visit.user) ?? ''}
                        alt={formatUserName(visit.user?.firstName, visit.user?.lastName, 'Unknown')}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatUserName(visit.user?.firstName, visit.user?.lastName, 'Unknown')}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {formatDateShort(visit.scheduledDate, locale)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {visit.scheduledTime}
                </td>
                <td className="px-4 py-3">
                  {visit.vehicle ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Car className="h-4 w-4" />
                      <span>
                        {visit.vehicle.make} {visit.vehicle.model}
                        {visit.vehicle.licensePlate && ` (${visit.vehicle.licensePlate})`}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      {t('recentVisits.noVehicle', { defaultValue: 'No vehicle' })}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <ServiceStatusBadge
                    status={visit.status as 'pending' | 'confirmed' | 'cancelled' | 'completed'}
                    variant="visit"
                  />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
