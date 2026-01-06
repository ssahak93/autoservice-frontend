'use client';

import { Info } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function ServiceSettings() {
  const t = useTranslations('dashboard.settings.service');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('title', { defaultValue: 'Service Settings' })}
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {t('description', { defaultValue: 'Manage your service profile and basic information' })}
        </p>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {t('info', {
                defaultValue:
                  'Most service settings can be managed from the "My Service" page. Click the link below to edit your service profile, working hours, and photos.',
              })}
            </p>
            <Link
              href="/my-service"
              className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              {t('goToMyService', { defaultValue: 'Go to My Service →' })}
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('availableSettings', { defaultValue: 'Available Settings' })}
          </h3>
          <ul className="mt-2 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• {t('settings.profile', { defaultValue: 'Service profile and description' })}</li>
            <li>• {t('settings.hours', { defaultValue: 'Working hours and availability' })}</li>
            <li>• {t('settings.photos', { defaultValue: 'Profile and work photos' })}</li>
            <li>• {t('settings.location', { defaultValue: 'Location and address' })}</li>
            <li>• {t('settings.services', { defaultValue: 'Service types offered' })}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
