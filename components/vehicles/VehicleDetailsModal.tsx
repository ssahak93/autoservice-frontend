'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Car, X, Edit, Copy, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { getAnimationVariants } from '@/lib/utils/animations';
import { formatDate } from '@/lib/utils/date';
import { useUIStore } from '@/stores/uiStore';
import type { Vehicle } from '@/types';

interface VehicleDetailsModalProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export function VehicleDetailsModal({
  vehicle,
  isOpen,
  onClose,
  onEdit,
}: VehicleDetailsModalProps) {
  const t = useTranslations('vehicles');
  const { showToast } = useUIStore();
  const variants = getAnimationVariants();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      showToast(t('copied', { defaultValue: 'Copied to clipboard!' }), 'success');
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      showToast(t('copyError', { defaultValue: 'Failed to copy' }), 'error');
    }
  };

  const formatVehicleName = () => {
    const parts: string[] = [];
    if (vehicle.make) parts.push(vehicle.make);
    if (vehicle.model) parts.push(vehicle.model);
    if (vehicle.year) parts.push(vehicle.year.toString());
    return parts.length > 0
      ? parts.join(' ')
      : t('unnamedVehicle', { defaultValue: 'Unnamed Vehicle' });
  };

  const getEngineTypeLabel = (engineType?: string) => {
    if (!engineType) return null;
    const engineTypeLabels: Record<string, string> = {
      gasoline: t('engineType.gasoline', { defaultValue: 'Gasoline' }),
      diesel: t('engineType.diesel', { defaultValue: 'Diesel' }),
      electric: t('engineType.electric', { defaultValue: 'Electric' }),
      hybrid: t('engineType.hybrid', { defaultValue: 'Hybrid' }),
      plug_in_hybrid: t('engineType.plugInHybrid', { defaultValue: 'Plug-in Hybrid' }),
      lpg: t('engineType.lpg', { defaultValue: 'LPG' }),
      cng: t('engineType.cng', { defaultValue: 'CNG' }),
      other: t('engineType.other', { defaultValue: 'Other' }),
    };
    return engineTypeLabels[engineType] || engineType;
  };

  const getLpgTypeLabel = (lpgType?: string) => {
    if (!lpgType) return null;
    const lpgLabels: Record<string, string> = {
      liquid_gas: t('lpgType.liquidGas', { defaultValue: 'Liquid Gas (LPG)' }),
      methane: t('lpgType.methane', { defaultValue: 'Methane (CNG)' }),
    };
    return lpgLabels[lpgType] || lpgType;
  };

  if (!isOpen) return null;

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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={variants.modal.initial}
              animate={variants.modal.animate}
              exit={variants.modal.exit}
              className="glass-light max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl p-4 shadow-2xl sm:rounded-2xl sm:p-5"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="vehicle-details-title"
            >
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-400 to-secondary-400">
                    <Car className="h-5 w-5 text-white" />
                  </div>
                  <h2
                    id="vehicle-details-title"
                    className="font-display text-xl font-bold text-neutral-900 dark:text-white"
                  >
                    {t('vehicleDetails', { defaultValue: 'Vehicle Details' })}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
                  aria-label={t('close', { defaultValue: 'Close' })}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {/* Vehicle Name */}
                <div className="rounded-lg border-2 border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800">
                  <h3 className="font-display text-lg font-semibold text-neutral-900 dark:text-white">
                    {formatVehicleName()}
                  </h3>
                  {vehicle.licensePlate && (
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                      {t('licensePlate', { defaultValue: 'License Plate' })}: {vehicle.licensePlate}
                    </p>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Make */}
                  {vehicle.make && (
                    <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
                      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        {t('make', { defaultValue: 'Make' })}
                      </p>
                      <p className="mt-1 text-base font-semibold text-neutral-900 dark:text-white">
                        {vehicle.make}
                      </p>
                    </div>
                  )}

                  {/* Model */}
                  {vehicle.model && (
                    <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
                      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        {t('model', { defaultValue: 'Model' })}
                      </p>
                      <p className="mt-1 text-base font-semibold text-neutral-900 dark:text-white">
                        {vehicle.model}
                      </p>
                    </div>
                  )}

                  {/* Year */}
                  {vehicle.year && (
                    <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
                      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        {t('year', { defaultValue: 'Year' })}
                      </p>
                      <p className="mt-1 text-base font-semibold text-neutral-900 dark:text-white">
                        {vehicle.year}
                      </p>
                    </div>
                  )}

                  {/* Color */}
                  {vehicle.color && (
                    <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
                      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        {t('color', { defaultValue: 'Color' })}
                      </p>
                      <p className="mt-1 text-base font-semibold text-neutral-900 dark:text-white">
                        {vehicle.color}
                      </p>
                    </div>
                  )}

                  {/* Engine */}
                  {vehicle.engine && (
                    <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
                      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        {t('engine', { defaultValue: 'Engine' })}
                      </p>
                      <p className="mt-1 text-base font-semibold text-neutral-900 dark:text-white">
                        {vehicle.engine}
                      </p>
                    </div>
                  )}

                  {/* Engine Type */}
                  {vehicle.engineType && (
                    <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
                      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        {t('engineTypeLabel', { defaultValue: 'Engine Type' })}
                      </p>
                      <p className="mt-1 text-base font-semibold text-neutral-900 dark:text-white">
                        {getEngineTypeLabel(vehicle.engineType)}
                      </p>
                    </div>
                  )}

                  {/* Horsepower */}
                  {vehicle.horsepower && (
                    <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
                      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        {t('horsepower', { defaultValue: 'Horsepower' })}
                      </p>
                      <p className="mt-1 text-base font-semibold text-neutral-900 dark:text-white">
                        {vehicle.horsepower} {t('hp', { defaultValue: 'HP' })}
                      </p>
                    </div>
                  )}

                  {/* VIN */}
                  {vehicle.vin && (
                    <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                          {t('vin', { defaultValue: 'VIN Code' })}
                        </p>
                        <button
                          onClick={() => {
                            if (vehicle.vin) {
                              handleCopy(vehicle.vin, 'vin');
                            }
                          }}
                          className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-primary-600 dark:hover:bg-neutral-700"
                          aria-label={t('copy', { defaultValue: 'Copy' })}
                        >
                          {copiedField === 'vin' ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="mt-1 break-all text-base font-semibold text-neutral-900 dark:text-white">
                        {vehicle.vin}
                      </p>
                    </div>
                  )}

                  {/* Technical Passport */}
                  {vehicle.technicalPassport && (
                    <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                          {t('technicalPassport', { defaultValue: 'Technical Passport' })}
                        </p>
                        <button
                          onClick={() => {
                            if (vehicle.technicalPassport) {
                              handleCopy(vehicle.technicalPassport, 'technicalPassport');
                            }
                          }}
                          className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-primary-600 dark:hover:bg-neutral-700"
                          aria-label={t('copy', { defaultValue: 'Copy' })}
                        >
                          {copiedField === 'technicalPassport' ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="mt-1 break-all text-base font-semibold text-neutral-900 dark:text-white">
                        {vehicle.technicalPassport}
                      </p>
                    </div>
                  )}

                  {/* LPG System */}
                  {vehicle.hasLpgSystem && (
                    <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
                      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        {t('hasLpgSystem', { defaultValue: 'LPG System' })}
                      </p>
                      <p className="mt-1 text-base font-semibold text-neutral-900 dark:text-white">
                        {vehicle.lpgType
                          ? getLpgTypeLabel(vehicle.lpgType)
                          : t('yes', { defaultValue: 'Yes' })}
                      </p>
                    </div>
                  )}

                  {/* Visit Count */}
                  {vehicle.visitCount !== undefined && (
                    <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
                      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        {t('visits', { defaultValue: 'Total Visits' })}
                      </p>
                      <p className="mt-1 text-base font-semibold text-neutral-900 dark:text-white">
                        {vehicle.visitCount}
                      </p>
                    </div>
                  )}

                  {/* Created At */}
                  {vehicle.createdAt && (
                    <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
                      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        {t('addedOn', { defaultValue: 'Added On' })}
                      </p>
                      <p className="mt-1 text-base font-semibold text-neutral-900 dark:text-white">
                        {formatDate(vehicle.createdAt)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {vehicle.notes && (
                  <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      {t('notes', { defaultValue: 'Notes' })}
                    </p>
                    <p className="mt-2 text-base text-neutral-900 dark:text-white">
                      {vehicle.notes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 border-t border-neutral-200 pt-3 dark:border-neutral-700">
                  <Button type="button" variant="ghost" onClick={onClose}>
                    {t('close', { defaultValue: 'Close' })}
                  </Button>
                  {onEdit && (
                    <Button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEdit();
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {t('editVehicle', { defaultValue: 'Edit Vehicle' })}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
