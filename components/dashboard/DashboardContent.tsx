'use client';

import { useTranslations } from 'next-intl';

import { DashboardStats } from './DashboardStats';
import { RecentVisits } from './RecentVisits';

export function DashboardContent() {
  const t = useTranslations('dashboard');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('title', { defaultValue: 'Dashboard' })}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('subtitle', { defaultValue: 'Overview of your auto service' })}
        </p>
      </div>

      <DashboardStats />

      <div className="mt-8">
        <RecentVisits />
      </div>
    </div>
  );
}
