'use client';

// Import only needed functions from date-fns for tree shaking
import { format } from 'date-fns/format';
import { parseISO } from 'date-fns/parseISO';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Calendar, User, FileText } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';
import { getAnimationVariants } from '@/lib/utils/animations';
import type { Visit } from '@/types';

// Lazy load VisitHistory component
const VisitHistory = dynamic(
  () => import('@/components/visits/VisitHistory').then((mod) => ({ default: mod.VisitHistory })),
  {
    ssr: false,
  }
);

interface VisitDetailsModalProps {
  visit: Visit;
  isOpen: boolean;
  onClose: () => void;
  onAction: (visit: Visit, action: 'accept' | 'complete' | 'cancel' | 'reschedule') => void;
}

export function VisitDetailsModal({ visit, isOpen, onClose, onAction }: VisitDetailsModalProps) {
  const t = useTranslations('dashboard.visits');
  const variants = getAnimationVariants();

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'PPP', { locale: undefined });
    } catch {
      return dateStr;
    }
  };

  const customerName =
    visit.user?.firstName || visit.user?.lastName
      ? `${visit.user.firstName || ''} ${visit.user.lastName || ''}`.trim()
      : t('customer', { defaultValue: 'Customer' });

  const getAvailableActions = () => {
    const actions: Array<{ key: 'accept' | 'complete' | 'cancel' | 'reschedule'; label: string }> =
      [];

    if (visit.status === 'pending') {
      actions.push({ key: 'accept', label: t('actions.accept', { defaultValue: 'Accept' }) });
      actions.push({ key: 'cancel', label: t('actions.cancel', { defaultValue: 'Cancel' }) });
      actions.push({
        key: 'reschedule',
        label: t('actions.reschedule', { defaultValue: 'Reschedule' }),
      });
    } else if (visit.status === 'confirmed') {
      actions.push({ key: 'complete', label: t('actions.complete', { defaultValue: 'Complete' }) });
      actions.push({ key: 'cancel', label: t('actions.cancel', { defaultValue: 'Cancel' }) });
      actions.push({
        key: 'reschedule',
        label: t('actions.reschedule', { defaultValue: 'Reschedule' }),
      });
    }

    return actions;
  };

  if (!isOpen) return null;

  const actions = getAvailableActions();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={variants.fadeIn.initial}
            animate={variants.fadeIn.animate}
            exit={variants.fadeIn.exit}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={variants.modal.initial}
              animate={variants.modal.animate}
              exit={variants.modal.exit}
              className="glass-light w-full max-w-2xl rounded-xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="visit-details-title"
            >
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <h2
                  id="visit-details-title"
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                >
                  {t('details.title', { defaultValue: 'Visit Details' })}
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label={t('close', { defaultValue: 'Close' })}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{customerName}</p>
                    {visit.user?.phoneNumber && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {visit.user.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date & Time */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(visit.scheduledDate)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('details.time', { defaultValue: 'Time' })}: {visit.scheduledTime}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Problem Description */}
                {visit.problemDescription && (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {t('details.problemDescription', { defaultValue: 'Problem Description' })}
                      </h3>
                    </div>
                    <p className="rounded-lg bg-gray-50 p-4 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {visit.problemDescription}
                    </p>
                  </div>
                )}

                {/* Status */}
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('details.status', { defaultValue: 'Status' })}:
                  </span>
                  <span className="ml-2 capitalize text-gray-900 dark:text-white">
                    {visit.status}
                  </span>
                </div>

                {/* Visit History */}
                <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                  <VisitHistory visitId={visit.id} />
                </div>
              </div>

              {/* Actions */}
              {actions.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
                  {actions.map((action) => (
                    <Button
                      key={action.key}
                      variant={action.key === 'cancel' ? 'danger' : 'primary'}
                      onClick={() => {
                        onAction(visit, action.key);
                        onClose();
                      }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
