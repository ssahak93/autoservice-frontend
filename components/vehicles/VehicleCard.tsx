'use client';

import { motion } from 'framer-motion';
import { Car, Edit, Trash2, Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useDeleteVehicle } from '@/hooks/useVehicles';
import { useUIStore } from '@/stores/uiStore';
import type { Vehicle } from '@/types';

import { EditVehicleModal } from './EditVehicleModal';
import { VehicleDetailsModal } from './VehicleDetailsModal';

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function VehicleCard({ vehicle, onEdit, onDelete }: VehicleCardProps) {
  const t = useTranslations('vehicles');
  const { mutate: deleteVehicle, isPending: isDeleting } = useDeleteVehicle();
  const { showToast } = useUIStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleDelete = () => {
    deleteVehicle(vehicle.id, {
      onSuccess: () => {
        showToast(t('vehicleDeleted', { defaultValue: 'Vehicle deleted successfully' }), 'success');
        setShowDeleteDialog(false);
        if (onDelete) {
          onDelete();
        }
      },
      onError: (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : String(error);
        showToast(
          errorMessage || t('vehicleDeleteError', { defaultValue: 'Failed to delete vehicle' }),
          'error'
        );
      },
    });
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

  const formatEngineInfo = () => {
    const parts: string[] = [];
    if (vehicle.engine) parts.push(vehicle.engine);
    if (vehicle.engineType) {
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
      parts.push(engineTypeLabels[vehicle.engineType] || vehicle.engineType);
    }
    if (vehicle.hasLpgSystem && vehicle.lpgType) {
      const lpgLabels: Record<string, string> = {
        liquid_gas: t('lpgType.liquidGas', { defaultValue: 'LPG' }),
        methane: t('lpgType.methane', { defaultValue: 'CNG' }),
      };
      parts.push(`+ ${lpgLabels[vehicle.lpgType] || vehicle.lpgType}`);
    }
    return parts.join(' ');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -4 }}
        className="glass-light overflow-hidden rounded-xl transition-shadow hover:shadow-xl"
      >
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary-400 to-secondary-400">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg font-semibold text-neutral-900 dark:text-white">
                  {formatVehicleName()}
                </h3>
                {vehicle.licensePlate ? (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {vehicle.licensePlate}
                  </p>
                ) : (
                  <p className="text-xs italic text-neutral-500 dark:text-neutral-500">
                    {t('noLicensePlate', { defaultValue: 'No license plate' })}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDetailsModal(true)}
                className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-primary-600 dark:text-neutral-400 dark:hover:bg-neutral-800"
                aria-label={t('viewDetails', { defaultValue: 'View Details' })}
                title={t('viewDetails', { defaultValue: 'View Details' })}
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-primary-600 dark:text-neutral-400 dark:hover:bg-neutral-800"
                aria-label={t('edit', { defaultValue: 'Edit' })}
                title={t('edit', { defaultValue: 'Edit' })}
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-error-600 dark:text-neutral-400 dark:hover:bg-neutral-800"
                aria-label={t('delete', { defaultValue: 'Delete' })}
                title={t('delete', { defaultValue: 'Delete' })}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            {/* Always show at least one detail or placeholder */}
            {formatEngineInfo() ? (
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <span className="font-medium">{t('engine', { defaultValue: 'Engine' })}:</span>
                <span>{formatEngineInfo()}</span>
              </div>
            ) : (
              <div className="text-sm text-neutral-500 dark:text-neutral-500">
                {t('noDetailsAvailable', { defaultValue: 'No additional details' })}
              </div>
            )}

            {vehicle.horsepower && (
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <span className="font-medium">
                  {t('horsepower', { defaultValue: 'Horsepower' })}:
                </span>
                <span>
                  {vehicle.horsepower} {t('hp', { defaultValue: 'л.с.' })}
                </span>
              </div>
            )}

            {vehicle.color && (
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <span className="font-medium">{t('color', { defaultValue: 'Color' })}:</span>
                <span>{vehicle.color}</span>
              </div>
            )}

            {vehicle.visitCount !== undefined && vehicle.visitCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <span className="font-medium">{t('visits', { defaultValue: 'Visits' })}:</span>
                <span>{vehicle.visitCount}</span>
              </div>
            )}
          </div>

          {vehicle.notes && (
            <div className="mt-4 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{vehicle.notes}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Details Modal */}
      <VehicleDetailsModal
        vehicle={vehicle}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onEdit={() => {
          setShowDetailsModal(false);
          setShowEditModal(true);
        }}
      />

      {/* Edit Modal */}
      <EditVehicleModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        vehicle={vehicle}
        onSuccess={() => {
          setShowEditModal(false);
          if (onEdit) {
            onEdit();
          }
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title={t('deleteVehicle', { defaultValue: 'Delete Vehicle' })}
        message={t('deleteVehicleConfirm', {
          defaultValue:
            'Are you sure you want to delete this vehicle? This action cannot be undone.',
        })}
        confirmText={t('delete', { defaultValue: 'Delete' })}
        cancelText={t('cancel', { defaultValue: 'Cancel' })}
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
