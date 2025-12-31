'use client';

import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import {
  formatDayRange,
  getCurrentDay,
  groupWorkingHours,
  isCurrentlyOpen,
  type WorkingHours as WorkingHoursUtil,
} from '@/lib/utils/workingHours';
import type { WorkingHours as WorkingHoursType } from '@/types';

interface WorkingHoursProps {
  workingHours: WorkingHoursType | undefined;
}

/**
 * WorkingHours Component
 *
 * Single Responsibility: Only handles working hours display
 * Smart UI: Groups similar hours and highlights current day
 */
export function WorkingHours({ workingHours }: WorkingHoursProps): ReactNode {
  const t = useTranslations('services');
  const locale = useLocale();

  // Check if working hours exist and are valid
  if (!workingHours || Object.keys(workingHours).length === 0) {
    return null;
  }

  const grouped = groupWorkingHours(workingHours as WorkingHoursUtil);

  // If no valid groups after processing, don't show the component
  if (grouped.length === 0) {
    return null;
  }

  const currentDay = getCurrentDay();
  const isOpen = isCurrentlyOpen(workingHours as WorkingHoursUtil);

  // Only show status if we can determine it (not null)

  return (
    <div className="mb-6 sm:mb-8">
      <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-neutral-900 sm:text-2xl">
          <Clock className="h-5 w-5 flex-shrink-0 sm:h-6 sm:w-6" />
          <span>{String(t('workingHours'))}</span>
        </h2>
        {/* Only show status if we have valid working hours */}
        {isOpen !== null &&
          (isOpen ? (
            <div className="flex w-full items-center justify-center gap-1.5 rounded-full bg-success-50 px-3 py-1.5 text-xs font-medium text-success-700 sm:w-auto sm:px-4 sm:py-2 sm:text-sm">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span className="whitespace-nowrap">
                {t('openNow', { defaultValue: 'Open now' })}
              </span>
            </div>
          ) : (
            <div className="flex w-full items-center justify-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 sm:w-auto sm:px-4 sm:py-2 sm:text-sm">
              <XCircle className="h-4 w-4 flex-shrink-0" />
              <span className="whitespace-nowrap">
                {t('closedNow', { defaultValue: 'Closed' })}
              </span>
            </div>
          ))}
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
        <div className="space-y-2 sm:space-y-3">
          {grouped.map((group, index) => {
            const isCurrentDayInGroup = group.days.some((day) => day.toLowerCase() === currentDay);

            return (
              <div
                key={index}
                className={`flex flex-col gap-2 border-b border-neutral-100 pb-2 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pb-3 ${
                  isCurrentDayInGroup
                    ? '-mx-1 rounded-md bg-primary-50 px-2 py-2 sm:-mx-2 sm:px-3'
                    : ''
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-sm font-medium sm:text-base ${
                      isCurrentDayInGroup ? 'text-primary-700' : 'text-neutral-700'
                    }`}
                  >
                    {formatDayRange(group.days, locale)}
                  </span>
                  {isCurrentDayInGroup && (
                    <span className="rounded-full bg-primary-600 px-2 py-0.5 text-xs font-medium text-white">
                      {t('today', { defaultValue: 'Today' })}
                    </span>
                  )}
                </div>
                <span
                  className={`text-sm font-semibold sm:text-base ${
                    isCurrentDayInGroup ? 'text-primary-700' : 'text-neutral-900'
                  }`}
                >
                  {group.hours.open} - {group.hours.close}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
