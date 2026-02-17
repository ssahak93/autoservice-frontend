'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useUpdateVehicle } from '@/hooks/useVehicles';
import { getAnimationVariants } from '@/lib/utils/animations';
import { useUIStore } from '@/stores/uiStore';
import type { EngineType, LpgType, Vehicle } from '@/types';

const updateVehicleSchema = (t: (key: string, options?: { defaultValue?: string }) => string) => {
  return z.object({
    make: z
      .string()
      .min(2, t('makeRequired', { defaultValue: 'Make is required' }))
      .optional(),
    model: z
      .string()
      .min(2, t('modelRequired', { defaultValue: 'Model is required' }))
      .optional(),
    year: z
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear() + 1)
      .optional()
      .nullable(),
    licensePlate: z.string().max(20).optional().nullable(),
    color: z.string().max(30).optional().nullable(),
    vin: z.string().max(17).optional().nullable(),
    technicalPassport: z.string().max(50).optional().nullable(),
    engine: z.string().max(20).optional().nullable(),
    engineType: z
      .enum(['gasoline', 'diesel', 'electric', 'hybrid', 'plug_in_hybrid', 'lpg', 'cng', 'other'])
      .optional()
      .nullable(),
    hasLpgSystem: z.boolean().optional(),
    lpgType: z.enum(['liquid_gas', 'methane']).optional().nullable(),
    horsepower: z.number().int().min(1).max(2000).optional().nullable(),
    notes: z.string().optional().nullable(),
  });
};

type VehicleFormData = z.infer<ReturnType<typeof updateVehicleSchema>>;

interface EditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  onSuccess?: () => void;
}

export function EditVehicleModal({ isOpen, onClose, vehicle, onSuccess }: EditVehicleModalProps) {
  const t = useTranslations('vehicles');
  const { mutate: updateVehicle, isPending } = useUpdateVehicle();
  const { showToast } = useUIStore();
  const variants = getAnimationVariants();
  const vehicleSchema = updateVehicleSchema(t);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year || null,
      licensePlate: vehicle.licensePlate || null,
      color: vehicle.color || null,
      vin: vehicle.vin || null,
      technicalPassport: vehicle.technicalPassport || null,
      engine: vehicle.engine || null,
      engineType: vehicle.engineType || null,
      hasLpgSystem: vehicle.hasLpgSystem,
      lpgType: vehicle.lpgType || null,
      horsepower: vehicle.horsepower || null,
      notes: vehicle.notes || null,
    },
  });

  const hasLpgSystem = watch('hasLpgSystem');

  // Clear lpgType when hasLpgSystem is false
  useEffect(() => {
    if (!hasLpgSystem) {
      setValue('lpgType', null);
    }
  }, [hasLpgSystem, setValue]);

  // Reset form when modal closes or vehicle changes
  useEffect(() => {
    if (!isOpen) {
      reset();
    } else {
      reset({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year || null,
        licensePlate: vehicle.licensePlate || null,
        color: vehicle.color || null,
        vin: vehicle.vin || null,
        technicalPassport: vehicle.technicalPassport || null,
        engine: vehicle.engine || null,
        engineType: vehicle.engineType || null,
        hasLpgSystem: vehicle.hasLpgSystem,
        lpgType: vehicle.lpgType || null,
        horsepower: vehicle.horsepower || null,
        notes: vehicle.notes || null,
      });
    }
  }, [isOpen, vehicle, reset]);

  const onSubmit = (data: VehicleFormData) => {
    updateVehicle(
      {
        vehicleId: vehicle.id,
        data: {
          make: data.make,
          model: data.model,
          year: data.year ?? undefined,
          licensePlate:
            data.licensePlate !== null && data.licensePlate !== '' ? data.licensePlate : undefined,
          color: data.color !== null && data.color !== '' ? data.color : undefined,
          vin: data.vin !== null && data.vin !== '' ? data.vin : undefined,
          technicalPassport:
            data.technicalPassport !== null && data.technicalPassport !== ''
              ? data.technicalPassport
              : undefined,
          engine: data.engine !== null && data.engine !== '' ? data.engine : undefined,
          engineType: data.engineType ?? undefined,
          hasLpgSystem: data.hasLpgSystem,
          lpgType: data.hasLpgSystem ? (data.lpgType ?? undefined) : undefined,
          horsepower: data.horsepower ?? undefined,
          notes: data.notes !== null && data.notes !== '' ? data.notes : undefined,
        },
      },
      {
        onSuccess: () => {
          showToast(
            t('vehicleUpdated', { defaultValue: 'Vehicle updated successfully' }),
            'success'
          );
          onClose();
          if (onSuccess) {
            onSuccess();
          }
        },
        onError: (error: unknown) => {
          const errorMessage = error instanceof Error ? error.message : String(error);
          showToast(
            errorMessage || t('vehicleUpdateError', { defaultValue: 'Failed to update vehicle' }),
            'error'
          );
        },
      }
    );
  };

  const engineTypeOptions: Array<{ value: EngineType; label: string }> = [
    { value: 'gasoline', label: t('engineType.gasoline', { defaultValue: 'Gasoline' }) },
    { value: 'diesel', label: t('engineType.diesel', { defaultValue: 'Diesel' }) },
    { value: 'electric', label: t('engineType.electric', { defaultValue: 'Electric' }) },
    { value: 'hybrid', label: t('engineType.hybrid', { defaultValue: 'Hybrid' }) },
    {
      value: 'plug_in_hybrid',
      label: t('engineType.plugInHybrid', { defaultValue: 'Plug-in Hybrid' }),
    },
    { value: 'lpg', label: t('engineType.lpg', { defaultValue: 'LPG' }) },
    { value: 'cng', label: t('engineType.cng', { defaultValue: 'CNG' }) },
    { value: 'other', label: t('engineType.other', { defaultValue: 'Other' }) },
  ];

  const lpgTypeOptions: Array<{ value: LpgType; label: string }> = [
    { value: 'liquid_gas', label: t('lpgType.liquidGas', { defaultValue: 'Liquid Gas (LPG)' }) },
    { value: 'methane', label: t('lpgType.methane', { defaultValue: 'Methane (CNG)' }) },
  ];

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
              className="glass-light w-full max-w-2xl rounded-xl p-4 shadow-2xl sm:rounded-2xl sm:p-5"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-vehicle-title"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 id="edit-vehicle-title" className="font-display text-xl font-bold">
                  {t('editVehicle', { defaultValue: 'Edit Vehicle' })}
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label={t('close', { defaultValue: 'Close' })}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Make */}
                  <Controller
                    name="make"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label={t('make', { defaultValue: 'Make' })}
                        placeholder={t('makePlaceholder', { defaultValue: 'e.g., Toyota' })}
                        error={errors.make?.message}
                      />
                    )}
                  />

                  {/* Model */}
                  <Controller
                    name="model"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label={t('model', { defaultValue: 'Model' })}
                        placeholder={t('modelPlaceholder', { defaultValue: 'e.g., Camry' })}
                        error={errors.model?.message}
                      />
                    )}
                  />

                  {/* Year */}
                  <Controller
                    name="year"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        label={t('year', { defaultValue: 'Year' })}
                        placeholder={t('yearPlaceholder', { defaultValue: 'e.g., 2020' })}
                        error={errors.year?.message}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseInt(value, 10) : null);
                        }}
                      />
                    )}
                  />

                  {/* License Plate */}
                  <Controller
                    name="licensePlate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label={t('licensePlate', { defaultValue: 'License Plate' })}
                        placeholder={t('licensePlatePlaceholder', {
                          defaultValue: 'e.g., ABC-123',
                        })}
                        error={errors.licensePlate?.message}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    )}
                  />

                  {/* Color */}
                  <Controller
                    name="color"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label={t('color', { defaultValue: 'Color' })}
                        placeholder={t('colorPlaceholder', { defaultValue: 'e.g., Silver' })}
                        error={errors.color?.message}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    )}
                  />

                  {/* VIN */}
                  <Controller
                    name="vin"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label={t('vin', { defaultValue: 'VIN Code' })}
                        placeholder={t('vinPlaceholder', { defaultValue: '17 characters' })}
                        error={errors.vin?.message}
                        maxLength={17}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    )}
                  />

                  {/* Technical Passport */}
                  <Controller
                    name="technicalPassport"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label={t('technicalPassport', { defaultValue: 'Technical Passport' })}
                        placeholder={t('technicalPassportPlaceholder', {
                          defaultValue: 'e.g., 1234567890',
                        })}
                        error={errors.technicalPassport?.message}
                        maxLength={50}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    )}
                  />

                  {/* Engine */}
                  <Controller
                    name="engine"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label={t('engine', { defaultValue: 'Engine' })}
                        placeholder={t('enginePlaceholder', { defaultValue: 'e.g., 2.5L' })}
                        error={errors.engine?.message}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    )}
                  />

                  {/* Engine Type */}
                  <Controller
                    name="engineType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label={t('engineTypeLabel', { defaultValue: 'Engine Type' })}
                        options={[
                          {
                            value: '',
                            label: t('selectEngineType', { defaultValue: 'Select engine type' }),
                          },
                          ...engineTypeOptions,
                        ]}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    )}
                  />

                  {/* Horsepower */}
                  <Controller
                    name="horsepower"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        label={t('horsepower', { defaultValue: 'Horsepower (л.с.)' })}
                        placeholder={t('horsepowerPlaceholder', { defaultValue: 'e.g., 203' })}
                        error={errors.horsepower?.message}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseInt(value, 10) : null);
                        }}
                      />
                    )}
                  />
                </div>

                {/* LPG System */}
                <div className="space-y-1.5">
                  <Controller
                    name="hasLpgSystem"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-neutral-700">
                          {t('hasLpgSystem', {
                            defaultValue: 'Has LPG System (գազաբալոնային համակարգ)',
                          })}
                        </span>
                      </label>
                    )}
                  />

                  {/* LPG Type (shown only if hasLpgSystem is true) */}
                  {hasLpgSystem && (
                    <Controller
                      name="lpgType"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label={t('lpgTypeLabel', { defaultValue: 'LPG Type' })}
                          options={[
                            {
                              value: '',
                              label: t('selectLpgType', { defaultValue: 'Select LPG type' }),
                            },
                            ...lpgTypeOptions,
                          ]}
                          error={errors.lpgType?.message}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      )}
                    />
                  )}
                </div>

                {/* Notes */}
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                        {t('notes', { defaultValue: 'Notes' })}{' '}
                        <span className="text-neutral-400">
                          ({t('optional', { defaultValue: 'Optional' })})
                        </span>
                      </label>
                      <textarea
                        {...field}
                        className="w-full resize-none rounded-lg border-2 border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                        rows={3}
                        placeholder={t('notesPlaceholder', { defaultValue: 'Additional notes...' })}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </div>
                  )}
                />

                <div className="flex gap-3 pt-1">
                  <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                    {t('cancel', { defaultValue: 'Cancel' })}
                  </Button>
                  <Button type="submit" className="flex-1" isLoading={isPending}>
                    {t('saveChanges', { defaultValue: 'Save Changes' })}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
