'use client';

import { format } from 'date-fns';
import { Calendar, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { VisitChatButton } from '@/components/visits/VisitChatButton';
import { useVisits } from '@/hooks/useVisits';
import { Link } from '@/i18n/routing';

const statusIcons = {
  pending: AlertCircle,
  confirmed: CheckCircle2,
  cancelled: XCircle,
  completed: CheckCircle2,
};

const statusColors = {
  pending: 'text-warning-500',
  confirmed: 'text-success-500',
  cancelled: 'text-error-500',
  completed: 'text-primary-500',
};

export default function VisitsPage() {
  const t = useTranslations('visits');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { data, isLoading } = useVisits({ status: statusFilter });

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-neutral-900">{t('title')}</h1>
          <p className="mt-2 text-neutral-600">{t('subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setStatusFilter(undefined)}
            className={`rounded-lg px-4 py-2 transition-colors ${
              !statusFilter
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {t('all')}
          </button>
          {(['pending', 'confirmed', 'cancelled', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-4 py-2 capitalize transition-colors ${
                statusFilter === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {t(status)}
            </button>
          ))}
        </div>

        {/* Visits List */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          </div>
        )}

        {data && data.data.length === 0 && (
          <div className="rounded-lg bg-neutral-100 p-8 text-center">
            <p className="text-lg font-medium text-neutral-600">{t('noVisits')}</p>
            <Link href="/services">
              <Button className="mt-4">{t('bookNew')}</Button>
            </Link>
          </div>
        )}

        {data && data.data.length > 0 && (
          <div className="space-y-4">
            {data.data.map((visit) => {
              const StatusIcon = statusIcons[visit.status];
              return (
                <div
                  key={visit.id}
                  className="glass-light rounded-xl p-6 transition-shadow hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-4 flex items-center gap-3">
                        <StatusIcon className={`h-5 w-5 ${statusColors[visit.status]}`} />
                        <span className={`font-semibold capitalize ${statusColors[visit.status]}`}>
                          {t(visit.status)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-neutral-600">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(visit.preferredDate), 'PPP')} {t('at')}{' '}
                            {visit.preferredTime}
                          </span>
                        </div>

                        {visit.confirmedDate && (
                          <div className="flex items-center gap-2 text-sm text-success-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>
                              {t('confirmedLabel')}: {format(new Date(visit.confirmedDate), 'PPP')}{' '}
                              {t('at')} {visit.confirmedTime}
                            </span>
                          </div>
                        )}

                        {visit.description && (
                          <p className="text-neutral-700">{visit.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/services/${visit.autoServiceProfileId}`}>
                        <Button variant="outline" size="sm">
                          {t('viewDetails')}
                        </Button>
                      </Link>
                      <VisitChatButton
                        visitId={visit.id}
                        serviceName={
                          visit.autoServiceProfile?.autoService?.companyName ||
                          `${visit.autoServiceProfile?.autoService?.firstName || ''} ${visit.autoServiceProfile?.autoService?.lastName || ''}`.trim() ||
                          t('service')
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
