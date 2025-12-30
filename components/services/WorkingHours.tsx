'use client';

import { Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import type { WorkingHours as WorkingHoursType } from '@/types';

interface WorkingHoursProps {
  workingHours: WorkingHoursType | undefined;
}

export function WorkingHours({ workingHours }: WorkingHoursProps): ReactNode {
  const t = useTranslations('services');

  if (!workingHours || Object.keys(workingHours).length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-semibold">
        <Clock className="h-6 w-6" />
        <span>{String(t('workingHours'))}</span>
      </h2>
      <div className="space-y-2">
        {Object.entries(workingHours)
          .filter(([, hours]) => hours && typeof hours === 'object' && 'open' in hours && 'close' in hours)
          .map(([day, hours]) => {
            const hoursData = hours as { open: string; close: string };
            return (
              <div key={day} className="flex justify-between">
                <span className="font-medium capitalize">{day}</span>
                <span>
                  {hoursData.open} - {hoursData.close}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

