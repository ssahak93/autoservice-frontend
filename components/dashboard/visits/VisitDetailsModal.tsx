'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X, Calendar, User, FileText, Car, ExternalLink } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/routing';
import { getAnimationVariants } from '@/lib/utils/animations';
import { formatDate } from '@/lib/utils/date';
import { getAvatarUrl } from '@/lib/utils/file';
import { formatCustomerName } from '@/lib/utils/user';
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
  onAction?: (visit: Visit, action: 'accept' | 'complete' | 'cancel' | 'reschedule') => void;
  showActions?: boolean; // If false, hide action buttons (for user view)
  showCustomerInfo?: boolean; // If false, hide customer info (for user view)
  showServiceLink?: boolean; // If true, show link to service page (for user view)
}

export function VisitDetailsModal({
  visit,
  isOpen,
  onClose,
  onAction,
  showActions = true,
  showCustomerInfo = true,
  showServiceLink = false,
}: VisitDetailsModalProps) {
  const t = useTranslations(showActions ? 'dashboard.visits' : 'visits');
  const locale = useLocale();
  const variants = getAnimationVariants();

  const customerName = formatCustomerName(
    visit.user?.firstName,
    visit.user?.lastName,
    t('customer', { defaultValue: 'Customer' })
  );

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
              className="glass-light max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl p-6 shadow-2xl"
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
                {/* Customer Info - only show for service owners */}
                {showCustomerInfo && (
                  <div className="flex items-center gap-3">
                    {getAvatarUrl(visit.user) ? (
                      <Image
                        src={getAvatarUrl(visit.user) ?? ''}
                        alt={customerName}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{customerName}</p>
                      {visit.user?.phoneNumber && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {visit.user.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Service Info - only show for users */}
                {showServiceLink && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('details.service', { defaultValue: 'Service' })}
                    </h3>
                    <div className="flex items-center gap-3">
                      {(() => {
                        const autoService =
                          visit.autoServiceProfile?.autoService || visit.autoService;
                        const serviceAvatar = getAvatarUrl(autoService);
                        return serviceAvatar ? (
                          <Image
                            src={serviceAvatar}
                            alt={
                              autoService?.serviceType === 'company'
                                ? autoService?.companyName || 'Service'
                                : `${autoService?.firstName || ''} ${autoService?.lastName || ''}`.trim() ||
                                  'Service'
                            }
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                            <Car className="h-5 w-5" />
                          </div>
                        );
                      })()}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {(() => {
                            const autoService =
                              visit.autoServiceProfile?.autoService || visit.autoService;
                            const serviceType = autoService?.serviceType;
                            const isCompany = serviceType === 'company';

                            let serviceName = '';
                            if (isCompany && autoService?.companyName) {
                              serviceName = autoService.companyName;
                            } else if (
                              !isCompany &&
                              (autoService?.firstName || autoService?.lastName)
                            ) {
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
                      <Link href={`/services/${visit.autoServiceProfileId}`}>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          {t('viewService', { defaultValue: 'View Service' })}
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Date & Time */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(visit.scheduledDate || visit.preferredDate, locale)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('details.time', { defaultValue: 'Time' })}:{' '}
                        {visit.scheduledTime || visit.preferredTime}
                      </p>
                      {visit.confirmedDate && (
                        <p className="mt-1 text-sm text-success-600 dark:text-success-400">
                          {t('confirmedLabel', { defaultValue: 'Confirmed' })}:{' '}
                          {formatDate(visit.confirmedDate, locale)} {t('at')} {visit.confirmedTime}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vehicle Info */}
                {visit.vehicle && (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Car className="h-5 w-5 text-gray-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {t('details.vehicle', { defaultValue: 'Vehicle' })}
                      </h3>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                      <div className="space-y-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {visit.vehicle.make} {visit.vehicle.model}
                          {visit.vehicle.year && ` ${visit.vehicle.year}`}
                        </p>
                        {visit.vehicle.licensePlate && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t('details.licensePlate', { defaultValue: 'License Plate' })}:{' '}
                            {visit.vehicle.licensePlate}
                          </p>
                        )}
                        {visit.vehicle.color && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t('details.color', { defaultValue: 'Color' })}: {visit.vehicle.color}
                          </p>
                        )}
                        {(visit.vehicle.engine || visit.vehicle.engineType) && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t('details.engine', { defaultValue: 'Engine' })}:{' '}
                            {visit.vehicle.engine || ''}
                            {visit.vehicle.engine && visit.vehicle.engineType && ' '}
                            {visit.vehicle.engineType}
                          </p>
                        )}
                        {visit.vehicle.horsepower && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t('details.horsepower', { defaultValue: 'Horsepower' })}:{' '}
                            {visit.vehicle.horsepower} HP
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Problem Description */}
                {(visit.problemDescription || visit.description) && (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {t('details.problemDescription', { defaultValue: 'Problem Description' })}
                      </h3>
                    </div>
                    <p className="rounded-lg bg-gray-50 p-4 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {visit.problemDescription || visit.description}
                    </p>
                  </div>
                )}

                {/* Status */}
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('details.status', { defaultValue: 'Status' })}:
                  </span>
                  <span className="ml-2 font-semibold capitalize text-gray-900 dark:text-white">
                    {t(`status.${visit.status}`, {
                      defaultValue: visit.status.charAt(0).toUpperCase() + visit.status.slice(1),
                    })}
                  </span>
                </div>

                {/* Visit History */}
                <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                  <VisitHistory visitId={visit.id} visit={visit} />
                </div>
              </div>

              {/* Actions - only show for service owners */}
              {showActions && actions.length > 0 && onAction && (
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

              {/* Footer - only show for users */}
              {!showActions && (
                <div className="mt-6 flex justify-end border-t border-gray-200 pt-6 dark:border-gray-700">
                  <Button variant="outline" onClick={onClose}>
                    {t('close', { defaultValue: 'Close' })}
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
