'use client';

// Import only needed functions from date-fns for tree shaking
import { format } from 'date-fns/format';
import { parseISO } from 'date-fns/parseISO';
import { motion } from 'framer-motion';
import { Calendar, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';

import { ServiceCardSkeleton } from '@/components/auto-service/ServiceCardSkeleton';
import { ServiceStatusBadge } from '@/components/auto-service/ServiceStatusBadge';
import { Button } from '@/components/ui/Button';
import { getTransition } from '@/lib/utils/animations';
import type { Visit, PaginatedResponse } from '@/types';

interface VisitListProps {
  visits: Visit[];
  isLoading: boolean;
  pagination?: PaginatedResponse<Visit>['pagination'];
  onPageChange: (page: number) => void;
  onVisitClick: (visit: Visit) => void;
  onAction: (visit: Visit, action: 'accept' | 'complete' | 'cancel' | 'reschedule') => void;
}

export function VisitList({
  visits,
  isLoading,
  pagination,
  onPageChange,
  onVisitClick,
  onAction,
}: VisitListProps) {
  const t = useTranslations('dashboard.visits');

  // Memoize formatDate to prevent unnecessary re-creations
  const formatDate = useCallback((dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'PPP', { locale: undefined });
    } catch {
      return dateStr;
    }
  }, []);

  // Memoize getAvailableActions to prevent unnecessary re-creations
  const getAvailableActions = useCallback(
    (visit: Visit) => {
      const actions: Array<{
        key: 'accept' | 'complete' | 'cancel' | 'reschedule';
        label: string;
      }> = [];

      if (visit.status === 'pending') {
        actions.push({ key: 'accept', label: t('actions.accept', { defaultValue: 'Accept' }) });
        actions.push({ key: 'cancel', label: t('actions.cancel', { defaultValue: 'Cancel' }) });
        actions.push({
          key: 'reschedule',
          label: t('actions.reschedule', { defaultValue: 'Reschedule' }),
        });
      } else if (visit.status === 'confirmed') {
        actions.push({
          key: 'complete',
          label: t('actions.complete', { defaultValue: 'Complete' }),
        });
        actions.push({ key: 'cancel', label: t('actions.cancel', { defaultValue: 'Cancel' }) });
        actions.push({
          key: 'reschedule',
          label: t('actions.reschedule', { defaultValue: 'Reschedule' }),
        });
      }

      return actions;
    },
    [t]
  );

  if (isLoading) {
    return <ServiceCardSkeleton count={5} layout="list" />;
  }

  if (visits.length === 0) {
    return (
      <div className="glass-light rounded-xl p-12 text-center">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          {t('empty.title', { defaultValue: 'No visits found' })}
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t('empty.description', { defaultValue: 'No visits match your filters' })}
        </p>
      </div>
    );
  }

  const transition = getTransition(0.2);

  return (
    <div className="space-y-4">
      {visits.map((visit, index) => {
        const actions = getAvailableActions(visit);
        const customerName =
          visit.user?.firstName || visit.user?.lastName
            ? `${visit.user.firstName || ''} ${visit.user.lastName || ''}`.trim()
            : t('customer', { defaultValue: 'Customer' });

        return (
          <motion.div
            key={visit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: index * 0.05 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="glass-light rounded-xl p-6 transition-all hover:shadow-lg"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              {/* Main Info */}
              <div className="flex-1 space-y-3">
                <ServiceStatusBadge
                  status={visit.status as 'pending' | 'confirmed' | 'cancelled' | 'completed'}
                  variant="visit"
                />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{customerName}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(visit.scheduledDate)} {t('at', { defaultValue: 'at' })}{' '}
                      {visit.scheduledTime}
                    </span>
                  </div>

                  {visit.problemDescription && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {visit.problemDescription}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div
                className="flex flex-col gap-2 sm:flex-row"
                role="group"
                aria-label={t('actions.group', { defaultValue: 'Visit actions' })}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onVisitClick(visit)}
                  aria-label={t('actions.viewVisit', {
                    defaultValue: `View visit for ${customerName}`,
                  })}
                >
                  {t('actions.view', { defaultValue: 'View' })}
                </Button>
                {actions.map((action) => (
                  <Button
                    key={action.key}
                    variant={action.key === 'cancel' ? 'danger' : 'primary'}
                    size="sm"
                    onClick={() => onAction(visit, action.key)}
                    aria-label={`${action.label} visit for ${customerName}`}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            {t('pagination.previous', { defaultValue: 'Previous' })}
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {t('pagination.page', {
              defaultValue: 'Page {{current}} of {{total}}',
              current: pagination.page,
              total: pagination.totalPages,
            })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            {t('pagination.next', { defaultValue: 'Next' })}
          </Button>
        </div>
      )}
    </div>
  );
}
