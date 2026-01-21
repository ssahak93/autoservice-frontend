'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';

import { AddressAutocomplete } from '@/components/common/AddressAutocomplete';
import { Button } from '@/components/ui/Button';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { useUpdateProfile } from '@/hooks/useProfileMutations';
import { useProfileValidation } from '@/hooks/useProfileValidation';
import { useServiceTypes } from '@/hooks/useServiceTypes';
import { type AutoServiceProfile } from '@/lib/services/auto-service-profile.service';
import { formatPhoneForBackend, parsePhoneFromBackend } from '@/lib/utils/phone.util';

interface ProfileEditorProps {
  profile: AutoServiceProfile;
}

export function ProfileEditor({ profile }: ProfileEditorProps) {
  const t = useTranslations('myService.profile');

  // Load service types
  const { data: serviceTypes = [] } = useServiceTypes();

  // Use custom hook for validation (SOLID - Single Responsibility)
  const { schema } = useProfileValidation();

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: profile.description,
      specialization: profile.specialization || '',
      yearsOfExperience: profile.yearsOfExperience,
      address: profile.address,
      city: profile.city,
      region: profile.region,
      district: profile.district || '',
      latitude: Number(profile.latitude),
      longitude: Number(profile.longitude),
      phoneNumber: parsePhoneFromBackend(profile.phoneNumber),
      maxVisitsPerDay: profile.maxVisitsPerDay,
      serviceTypes: profile.services?.map((s) => s.serviceType.id) || [],
    },
  });

  // Use custom hook for update mutation (SOLID - Single Responsibility)
  const updateMutation = useUpdateProfile();

  const onSubmit = (data: FormData) => {
    // Format phone number for backend (add +374 prefix)
    const formattedData = {
      ...data,
      phoneNumber: formatPhoneForBackend(data.phoneNumber),
    };
    updateMutation.mutate(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          {t('title', { defaultValue: 'Edit Profile' })}
        </h2>
      </div>

      {/* Description */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('description', { defaultValue: 'Description' })} *
        </label>
        <textarea
          {...register('description')}
          rows={5}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          placeholder={t('descriptionPlaceholder', { defaultValue: 'Describe your service...' })}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Specialization */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('specialization', { defaultValue: 'Specialization' })}
        </label>
        <input
          {...register('specialization')}
          type="text"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          placeholder={t('specializationPlaceholder', { defaultValue: 'Your specialization...' })}
        />
      </div>

      {/* Years of Experience */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('yearsOfExperience', { defaultValue: 'Years of Experience' })}
        </label>
        <input
          {...register('yearsOfExperience', { valueAsNumber: true })}
          type="number"
          min="0"
          max="100"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('address', { defaultValue: 'Address' })} *
          </label>
          <AddressAutocomplete
            value={watch('address') || ''}
            onChange={(address) => {
              setValue('address', address, { shouldValidate: true });
            }}
            onSelect={(suggestion) => {
              // When user selects an address, update coordinates
              setValue('latitude', suggestion.latitude, { shouldValidate: true });
              setValue('longitude', suggestion.longitude, { shouldValidate: true });
            }}
            placeholder={t('enterAddress', { defaultValue: 'Enter address...' })}
            disabled={false}
            className="w-full"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t('addressHint', {
              defaultValue: 'Start typing to search for addresses',
            })}
          </p>
          {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('city', { defaultValue: 'City' })} *
          </label>
          <input
            {...register('city')}
            type="text"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('region', { defaultValue: 'Region' })} *
          </label>
          <input
            {...register('region')}
            type="text"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          {errors.region && <p className="mt-1 text-sm text-red-600">{errors.region.message}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('district', { defaultValue: 'District' })}
          </label>
          <input
            {...register('district')}
            type="text"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('latitude', { defaultValue: 'Latitude' })} *
          </label>
          <input
            {...register('latitude', { valueAsNumber: true })}
            type="number"
            step="0.000001"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          {errors.latitude && (
            <p className="mt-1 text-sm text-red-600">{errors.latitude.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('longitude', { defaultValue: 'Longitude' })} *
          </label>
          <input
            {...register('longitude', { valueAsNumber: true })}
            type="number"
            step="0.000001"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          {errors.longitude && (
            <p className="mt-1 text-sm text-red-600">{errors.longitude.message}</p>
          )}
        </div>
      </div>

      {/* Phone & Max Visits */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <PhoneInput
                label={t('phoneNumber', { defaultValue: 'Phone Number' })}
                required
                value={field.value || ''}
                onChange={field.onChange}
                error={errors.phoneNumber?.message}
                disabled={isSubmitting}
                helperText={t('phoneNumberHelper', {
                  defaultValue: 'Enter 8 or 9 digits (e.g., 98222680 or 098222680)',
                })}
              />
            )}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('maxVisitsPerDay', { defaultValue: 'Max Visits Per Day' })} *
          </label>
          <input
            {...register('maxVisitsPerDay', { valueAsNumber: true })}
            type="number"
            min="1"
            max="50"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          {errors.maxVisitsPerDay && (
            <p className="mt-1 text-sm text-red-600">{errors.maxVisitsPerDay.message}</p>
          )}
        </div>
      </div>

      {/* Service Types */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('serviceTypes', { defaultValue: 'Service Types' })} *
        </label>
        <Controller
          name="serviceTypes"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {serviceTypes.map((serviceType) => (
                <label
                  key={serviceType.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 p-3 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                >
                  <input
                    type="checkbox"
                    checked={field.value.includes(serviceType.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        field.onChange([...field.value, serviceType.id]);
                      } else {
                        field.onChange(field.value.filter((id) => id !== serviceType.id));
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {serviceType.displayName || serviceType.name}
                  </span>
                </label>
              ))}
            </div>
          )}
        />
        {errors.serviceTypes && (
          <p className="mt-1 text-sm text-red-600">{errors.serviceTypes.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={isSubmitting || updateMutation.isPending}
        >
          {t('reset', { defaultValue: 'Reset' })}
        </Button>
        <Button type="submit" isLoading={isSubmitting || updateMutation.isPending}>
          {t('save', { defaultValue: 'Save Changes' })}
        </Button>
      </div>
    </form>
  );
}
