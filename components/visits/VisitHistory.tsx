'use client';

import { Calendar, Clock, FileText, XCircle, AlertCircle } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

import { useVisitHistory } from '@/hooks/useVisits';
import type { VisitHistoryEntry } from '@/lib/services/visits.service';
import { formatDate, formatDateFull } from '@/lib/utils/date';

interface VisitHistoryProps {
  visitId: string;
}

const changeTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  scheduled_date: Calendar,
  scheduled_time: Clock,
  status: AlertCircle,
  problem_description: FileText,
  service_notes: FileText,
  cancellation: XCircle,
};

const changeTypeColors: Record<string, string> = {
  scheduled_date: 'text-blue-600',
  scheduled_time: 'text-blue-600',
  status: 'text-purple-600',
  problem_description: 'text-green-600',
  service_notes: 'text-orange-600',
  cancellation: 'text-red-600',
};

// Status labels are now translated by backend, so we don't need hardcoded labels

export function VisitHistory({ visitId }: VisitHistoryProps) {
  const t = useTranslations('visits');
  const locale = useLocale();
  const { data: history, isLoading } = useVisitHistory(visitId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-neutral-500">{t('loading', { defaultValue: 'Loading...' })}</div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-center">
        <p className="text-neutral-500">
          {t('noHistory', { defaultValue: 'No history available for this visit' })}
        </p>
      </div>
    );
  }

  const getChangeTypeLabel = (changeType: string): string => {
    const labels: Record<string, string> = {
      scheduled_date: t('history.dateChanged', { defaultValue: 'Date changed' }),
      scheduled_time: t('history.timeChanged', { defaultValue: 'Time changed' }),
      status: t('history.statusChanged', { defaultValue: 'Status changed' }),
      problem_description: t('history.problemDescriptionChanged', {
        defaultValue: 'Problem description changed',
      }),
      service_notes: t('history.serviceNotesChanged', { defaultValue: 'Service notes changed' }),
      cancellation: t('history.cancelled', { defaultValue: 'Visit cancelled' }),
    };
    return labels[changeType] || changeType;
  };

  const formatValue = (value: string | null, changeType: string): string => {
    if (!value) return '-';

    // Format dates according to locale
    if (changeType === 'scheduled_date') {
      return formatDate(value, locale);
    }

    // For status values, they are already translated by backend
    // For other values (times, notes), return as-is
    return value;
  };

  const getChangedByLabel = (entry: VisitHistoryEntry): string => {
    if (entry.changedByType === 'user') {
      return t('history.changedByCustomer', { defaultValue: 'Customer' });
    }
    if (entry.changedByType === 'service') {
      return t('history.changedByService', { defaultValue: 'Auto Service' });
    }
    return t('history.changedBySystem', { defaultValue: 'System' });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-neutral-900">
        {t('history.title', { defaultValue: 'Visit History' })}
      </h3>
      <div className="max-h-[400px] space-y-2 overflow-y-auto pr-2">
        {history.map((entry, index) => {
          const Icon = changeTypeIcons[entry.changeType] || FileText;
          const colorClass = changeTypeColors[entry.changeType] || 'text-neutral-600';

          return (
            <div
              key={entry.id}
              className="relative rounded-lg border border-neutral-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Timeline line */}
              {index < history.length - 1 && (
                <div className="absolute left-6 top-12 h-full w-0.5 bg-neutral-200" />
              )}

              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 ${colorClass}`}>
                  <div className="relative z-10 rounded-full bg-neutral-50 p-1.5">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-neutral-900">
                        {getChangeTypeLabel(entry.changeType)}
                      </h4>
                      <span className="text-xs text-neutral-500">{getChangedByLabel(entry)}</span>
                    </div>
                    <time className="text-xs text-neutral-500">
                      {formatDateFull(entry.createdAt, locale)}
                    </time>
                  </div>

                  {entry.description && (
                    <p className="mb-1.5 text-xs text-neutral-700">{entry.description}</p>
                  )}

                  {/* Old and new values */}
                  {(entry.oldValue || entry.newValue) && (
                    <div className="mt-1.5 space-y-0.5 rounded-md bg-neutral-50 p-1.5 text-xs">
                      {entry.oldValue && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-neutral-500">
                            {t('history.from', { defaultValue: 'From' })}:
                          </span>
                          <span className="text-neutral-700 line-through">
                            {formatValue(entry.oldValue, entry.changeType)}
                          </span>
                        </div>
                      )}
                      {entry.newValue && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-neutral-500">
                            {t('history.to', { defaultValue: 'To' })}:
                          </span>
                          <span className="font-medium text-neutral-900">
                            {formatValue(entry.newValue, entry.changeType)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
