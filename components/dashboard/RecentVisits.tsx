'use client';

import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

import { useAutoServiceVisits } from '@/hooks/useDashboard';

export function RecentVisits() {
  const t = useTranslations('dashboard');
  const { data, isLoading, error } = useAutoServiceVisits({
    page: 1,
    limit: 10,
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          {t('recentVisits.title', { defaultValue: 'Recent Visits' })}
        </h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
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
        <p className="text-red-600 dark:text-red-400">
          {t('recentVisits.error', { defaultValue: 'Failed to load visits' })}
        </p>
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
                {t('recentVisits.status', { defaultValue: 'Status' })}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {visits.map((visit) => (
              <tr key={visit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {visit.user?.firstName && visit.user?.lastName
                      ? `${visit.user.firstName} ${visit.user.lastName}`
                      : visit.user?.firstName || 'Unknown'}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {format(new Date(visit.scheduledDate), 'MMM dd, yyyy')}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {visit.scheduledTime}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      visit.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : visit.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : visit.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}
                  >
                    {visit.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
