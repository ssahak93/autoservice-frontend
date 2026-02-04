'use client';

// Import only needed functions from date-fns for tree shaking
import { isFuture } from 'date-fns/isFuture';
import { isPast } from 'date-fns/isPast';
import { isToday } from 'date-fns/isToday';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  History,
  Edit,
  Star,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useMemo } from 'react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CreateServiceBanner } from '@/components/auto-service/CreateServiceBanner';
import { Pagination } from '@/components/common/Pagination';
import { LeaveReviewModal } from '@/components/reviews/LeaveReviewModal';
import { Button } from '@/components/ui/Button';
import { BookVisitModal } from '@/components/visits/BookVisitModal';
import { VisitChatButton } from '@/components/visits/VisitChatButton';
import { useVisits, useCancelVisit } from '@/hooks/useVisits';
import { Link } from '@/i18n/routing';
import { formatDate } from '@/lib/utils/date';
import type { Visit } from '@/types';

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

// Visit Card Component
function VisitCard({
  visit,
  t,
  formatDate,
  onEdit,
  onCancel,
  onLeaveReview,
}: {
  visit: Visit;
  t: ReturnType<typeof useTranslations<'visits'>>;
  formatDate: (dateStr: string | undefined) => string;
  onEdit?: () => void;
  onCancel?: () => void;
  onLeaveReview?: () => void;
}) {
  const StatusIcon = statusIcons[visit.status];
  const canEdit = visit.status === 'pending' || visit.status === 'confirmed';
  const canCancel = visit.status !== 'completed' && visit.status !== 'cancelled';
  // Can review if visit is completed, no review exists, and visit date has passed
  const visitDate = visit.scheduledDate || visit.preferredDate;
  const canReview =
    visit.status === 'completed' &&
    !visit.review &&
    (visitDate ? new Date(visitDate) <= new Date() : true);

  return (
    <div className="glass-light rounded-xl p-6 transition-shadow hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-4 flex items-center gap-3">
            <StatusIcon className={`h-5 w-5 ${statusColors[visit.status]}`} />
            <span className={`font-semibold capitalize ${statusColors[visit.status]}`}>
              {t(visit.status)}
            </span>
          </div>

          <div className="space-y-2">
            {/* Service Name with Type */}
            <div className="mb-2">
              <p className="font-semibold text-neutral-900">
                {(() => {
                  const autoService = visit.autoServiceProfile?.autoService || visit.autoService;
                  const serviceType = autoService?.serviceType;
                  const isCompany = serviceType === 'company';

                  let serviceName = '';
                  if (isCompany && autoService?.companyName) {
                    serviceName = autoService.companyName;
                  } else if (!isCompany && (autoService?.firstName || autoService?.lastName)) {
                    serviceName =
                      `${autoService.firstName || ''} ${autoService.lastName || ''}`.trim();
                  } else {
                    serviceName = t('service', { defaultValue: 'Service' });
                  }

                  const typeLabel = isCompany
                    ? t('company', { defaultValue: 'Company' })
                    : t('individual', { defaultValue: 'Individual' });

                  return `${serviceName} (${typeLabel})`;
                })()}
              </p>
            </div>

            <div className="flex items-center gap-2 text-neutral-600">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(visit.scheduledDate || visit.preferredDate)} {t('at')}{' '}
                {visit.scheduledTime || visit.preferredTime}
              </span>
            </div>

            {visit.confirmedDate && (
              <div className="flex items-center gap-2 text-sm text-success-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  {t('confirmedLabel')}: {formatDate(visit.confirmedDate)} {t('at')}{' '}
                  {visit.confirmedTime}
                </span>
              </div>
            )}

            {(visit.problemDescription || visit.description) && (
              <p className="text-neutral-700">{visit.problemDescription || visit.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2 sm:flex-nowrap">
            <Link
              href={`/services/${visit.autoServiceProfileId}`}
              className="flex-1 sm:flex-initial"
            >
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                {t('viewDetails', { defaultValue: 'View Details' })}
              </Button>
            </Link>
            <div className="flex-1 sm:flex-initial">
              <VisitChatButton
                visitId={visit.id}
                serviceName={
                  visit.autoServiceProfile?.autoService?.companyName ||
                  `${visit.autoServiceProfile?.autoService?.firstName || ''} ${visit.autoServiceProfile?.autoService?.lastName || ''}`.trim() ||
                  t('service', { defaultValue: 'Service' })
                }
              />
            </div>
          </div>

          {/* Action buttons */}
          {(canEdit || canCancel || canReview) && (
            <div className="flex flex-wrap gap-2 border-t border-neutral-200 pt-2">
              {canReview && onLeaveReview && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onLeaveReview}
                  className="flex items-center gap-1"
                >
                  <Star className="h-4 w-4" />
                  {t('leaveReview', { defaultValue: 'Leave Review' })}
                </Button>
              )}
              {canEdit && onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  {t('edit', { defaultValue: 'Edit' })}
                </Button>
              )}
              {canCancel && onCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  className="flex items-center gap-1 text-warning-600 hover:bg-warning-50"
                >
                  <XCircle className="h-4 w-4" />
                  {t('cancelVisit', { defaultValue: 'Cancel' })}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VisitsPage() {
  const t = useTranslations('visits');
  const locale = useLocale();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [reviewingVisit, setReviewingVisit] = useState<Visit | null>(null);

  // Reset page when filter changes
  const handleStatusFilterChange = (status: string | undefined) => {
    setStatusFilter(status);
    setPage(1); // Reset to first page when filter changes
  };
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [cancellingVisit, setCancellingVisit] = useState<Visit | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const { data, isLoading } = useVisits({ status: statusFilter, page, limit: 20 });
  const cancelVisit = useCancelVisit();

  // Format date with locale using utility
  const formatDateLocal = (dateStr: string | undefined): string => {
    if (!dateStr) return t('dateNotSet', { defaultValue: 'Date not set' });
    return formatDate(dateStr, locale);
  };

  // Group visits by category: today, upcoming, past
  const groupedVisits = useMemo(() => {
    if (!data?.data) return { today: [], upcoming: [], past: [] };

    const today: typeof data.data = [];
    const upcoming: typeof data.data = [];
    const past: typeof data.data = [];

    data.data.forEach((visit) => {
      const visitDate = visit.scheduledDate || visit.preferredDate;
      if (!visitDate) {
        // If no date, consider it as upcoming
        upcoming.push(visit);
        return;
      }

      try {
        // Try parseISO first, fallback to new Date
        let date: Date;
        try {
          date = parseISO(visitDate);
        } catch {
          date = new Date(visitDate);
        }

        if (isNaN(date.getTime())) {
          // Invalid date, consider as upcoming
          upcoming.push(visit);
        } else if (isToday(date)) {
          today.push(visit);
        } else if (isFuture(date)) {
          upcoming.push(visit);
        } else if (isPast(date)) {
          past.push(visit);
        } else {
          // Same day, consider as today
          today.push(visit);
        }
      } catch {
        // If date parsing fails, consider it as upcoming
        upcoming.push(visit);
      }
    });

    return { today, upcoming, past };
  }, [data]);

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        {/* Create Service Banner */}
        <div className="mb-6">
          <div suppressHydrationWarning>
            <CreateServiceBanner />
          </div>
        </div>

        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-neutral-900">{t('title')}</h1>
          <p className="mt-2 text-neutral-600">{t('subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => handleStatusFilterChange(undefined)}
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
              onClick={() => handleStatusFilterChange(status)}
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
          <div className="space-y-8">
            {/* Pagination - Top */}
            {data.pagination && data.pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={data.pagination.page}
                  totalPages={data.pagination.totalPages}
                  onPageChange={(newPage) => {
                    setPage(newPage);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}

            {/* Today's Visits */}
            {groupedVisits.today.length > 0 && (
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                    <Clock className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900">
                      {t('today', { defaultValue: "Today's Visits" })}
                    </h2>
                    <p className="text-sm text-neutral-600">
                      {groupedVisits.today.length}{' '}
                      {groupedVisits.today.length === 1
                        ? t('visit', { defaultValue: 'visit' })
                        : t('visits', { defaultValue: 'visits' })}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {groupedVisits.today.map((visit) => (
                    <VisitCard
                      key={visit.id}
                      visit={visit}
                      t={t}
                      formatDate={formatDateLocal}
                      onEdit={() => setEditingVisit(visit)}
                      onCancel={() => {
                        setCancellingVisit(visit);
                        setCancelReason('');
                      }}
                      onLeaveReview={() => setReviewingVisit(visit)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Visits */}
            {groupedVisits.upcoming.length > 0 && (
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-100">
                    <Calendar className="h-5 w-5 text-success-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900">
                      {t('upcoming', { defaultValue: 'Upcoming Visits' })}
                    </h2>
                    <p className="text-sm text-neutral-600">
                      {groupedVisits.upcoming.length}{' '}
                      {groupedVisits.upcoming.length === 1
                        ? t('visit', { defaultValue: 'visit' })
                        : t('visits', { defaultValue: 'visits' })}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {groupedVisits.upcoming.map((visit) => (
                    <VisitCard
                      key={visit.id}
                      visit={visit}
                      t={t}
                      formatDate={formatDateLocal}
                      onEdit={() => setEditingVisit(visit)}
                      onCancel={() => {
                        setCancellingVisit(visit);
                        setCancelReason('');
                      }}
                      onLeaveReview={() => setReviewingVisit(visit)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past Visits */}
            {groupedVisits.past.length > 0 && (
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                    <History className="h-5 w-5 text-neutral-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900">
                      {t('past', { defaultValue: 'Past Visits' })}
                    </h2>
                    <p className="text-sm text-neutral-600">
                      {groupedVisits.past.length}{' '}
                      {groupedVisits.past.length === 1
                        ? t('visit', { defaultValue: 'visit' })
                        : t('visits', { defaultValue: 'visits' })}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {groupedVisits.past.map((visit) => (
                    <VisitCard
                      key={visit.id}
                      visit={visit}
                      t={t}
                      formatDate={formatDateLocal}
                      onEdit={() => setEditingVisit(visit)}
                      onCancel={() => {
                        setCancellingVisit(visit);
                        setCancelReason('');
                      }}
                      onLeaveReview={() => setReviewingVisit(visit)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Pagination - Bottom */}
            {data.pagination && data.pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={data.pagination.page}
                  totalPages={data.pagination.totalPages}
                  onPageChange={(newPage) => {
                    setPage(newPage);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Edit Visit Modal */}
        {editingVisit && (
          <BookVisitModal
            mode="edit"
            visitId={editingVisit.id}
            visit={{
              scheduledDate: editingVisit.scheduledDate || editingVisit.preferredDate,
              scheduledTime: editingVisit.scheduledTime || editingVisit.preferredTime,
              problemDescription: editingVisit.problemDescription || editingVisit.description,
              autoServiceId: editingVisit.autoServiceId,
              autoServiceProfileId: editingVisit.autoServiceProfileId,
            }}
            serviceName={
              editingVisit.autoServiceProfile?.autoService?.companyName ||
              `${editingVisit.autoServiceProfile?.autoService?.firstName || ''} ${editingVisit.autoServiceProfile?.autoService?.lastName || ''}`.trim() ||
              t('service', { defaultValue: 'Service' })
            }
            isOpen={!!editingVisit}
            onClose={() => setEditingVisit(null)}
            onSuccess={() => {
              setEditingVisit(null);
            }}
          />
        )}

        {/* Leave Review Modal */}
        {reviewingVisit && (
          <LeaveReviewModal
            isOpen={!!reviewingVisit}
            onClose={() => setReviewingVisit(null)}
            visit={reviewingVisit}
          />
        )}

        {/* Cancel Visit Modal */}
        {cancellingVisit && (
          <CancelVisitModal
            visit={cancellingVisit}
            reason={cancelReason}
            onReasonChange={setCancelReason}
            onClose={() => {
              setCancellingVisit(null);
              setCancelReason('');
            }}
            onConfirm={() => {
              cancelVisit.mutate(
                { id: cancellingVisit.id, reason: cancelReason || undefined },
                {
                  onSuccess: () => {
                    setCancellingVisit(null);
                    setCancelReason('');
                  },
                }
              );
            }}
            isLoading={cancelVisit.isPending}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

// Cancel Visit Modal Component
function CancelVisitModal({
  visit: _visit,
  reason,
  onReasonChange,
  onClose,
  onConfirm,
  isLoading,
}: {
  visit: Visit;
  reason: string;
  onReasonChange: (reason: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  const t = useTranslations('visits');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold">
          {t('cancelVisit', { defaultValue: 'Cancel Visit' })}
        </h2>
        <p className="mb-4 text-neutral-600">
          {t('confirmCancel', { defaultValue: 'Are you sure you want to cancel this visit?' })}
        </p>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">
            {t('cancelReason', { defaultValue: 'Cancellation reason (optional)' })}
          </label>
          <textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 p-2"
            rows={3}
            placeholder={t('cancelReason', { defaultValue: 'Cancellation reason (optional)' })}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
            {t('close', { defaultValue: 'Close' })}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-warning-500 hover:bg-warning-600"
          >
            {isLoading
              ? t('loading', { defaultValue: 'Loading...' })
              : t('cancelVisit', { defaultValue: 'Cancel Visit' })}
          </Button>
        </div>
      </div>
    </div>
  );
}
