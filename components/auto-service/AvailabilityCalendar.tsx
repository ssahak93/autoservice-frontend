'use client';

import { useTranslations } from 'next-intl';

import type { AutoServiceProfile } from '@/lib/services/auto-service-profile.service';

import { WorkingHoursEditor } from './WorkingHoursEditor';

interface AvailabilityCalendarProps {
  profile: AutoServiceProfile;
}

export function AvailabilityCalendar({ profile }: AvailabilityCalendarProps) {
  const t = useTranslations('myService.availability');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          {t('title', { defaultValue: 'Availability Management' })}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('description', {
            defaultValue: 'Manage your working hours and availability exceptions',
          })}
        </p>
      </div>

      {/* Working Hours Editor */}
      <WorkingHoursEditor profile={profile} />

      {/* Placeholder for availability exceptions calendar */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {t('exceptions', { defaultValue: 'Availability Exceptions' })}
        </h3>
        <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('exceptionsComingSoon', {
                defaultValue: 'Availability exceptions management coming soon',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
