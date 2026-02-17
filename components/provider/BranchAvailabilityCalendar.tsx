'use client';

import { useTranslations } from 'next-intl';

import type { ProviderBranch } from '@/lib/services/provider-branch.service';

import { BranchAvailabilityExceptionsManager } from './AvailabilityExceptionsManager';
import { WorkingHoursEditor } from './WorkingHoursEditor';

interface AvailabilityCalendarProps {
  profile: ProviderBranch;
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

      {/* Availability Exceptions Manager */}
      <BranchAvailabilityExceptionsManager branch={profile} />
    </div>
  );
}
