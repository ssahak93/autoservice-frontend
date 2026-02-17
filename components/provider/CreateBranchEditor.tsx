'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';

// Dynamically import Yandex Maps to avoid SSR issues
const YMaps = dynamic(() => import('@pbe/react-yandex-maps').then((mod) => mod.YMaps), {
  ssr: false,
});
const YMap = dynamic(() => import('@pbe/react-yandex-maps').then((mod) => mod.Map), {
  ssr: false,
});
const Placemark = dynamic(() => import('@pbe/react-yandex-maps').then((mod) => mod.Placemark), {
  ssr: false,
});

import { AddressAutocomplete } from '@/components/common/AddressAutocomplete';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useCreateProfile } from '@/hooks/useProfileMutations';
import { useServiceTypes } from '@/hooks/useServiceTypes';
import { queryKeys } from '@/lib/api/query-config';
import { FILE_CATEGORIES } from '@/lib/constants/file-categories.constants';
import { type UploadedFile } from '@/lib/services/files.service';
import { locationsService } from '@/lib/services/locations.service';
import { getCurrentLocale } from '@/lib/utils/i18n';
import { formatPhoneForBackend } from '@/lib/utils/phone.util';
import { commonValidations } from '@/lib/utils/validation';
import { useUIStore } from '@/stores/uiStore';

interface CreateBranchEditorProps {
  providerId?: string;
}

export function CreateBranchEditor({ providerId: _providerId }: CreateBranchEditorProps = {}) {
  const t = useTranslations('myService.profile');
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();
  const locale = getCurrentLocale();
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.1811, 44.5136]); // Yerevan default
  const [mounted] = useState(true);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');
  const [_selectedCommunityId, _setSelectedCommunityId] = useState<string>('');

  // Load regions and communities
  const { data: regions = [] } = useQuery({
    queryKey: queryKeys.regions(),
    queryFn: () => locationsService.getRegions(),
  });

  const { data: communities = [] } = useQuery({
    queryKey: queryKeys.communities(selectedRegionId),
    queryFn: () => locationsService.getCommunities(selectedRegionId),
    enabled: !!selectedRegionId,
  });

  // Photo upload state (similar to admin)
  const [profilePhotoFiles, setProfilePhotoFiles] = useState<UploadedFile[]>([]);
  const [workPhotoFiles, setWorkPhotoFiles] = useState<UploadedFile[]>([]);
  const [profilePhotoFileIds, setProfilePhotoFileIds] = useState<string[]>([]);
  const [workPhotoFileIds, setWorkPhotoFileIds] = useState<string[]>([]);

  // Geolocation hook
  const { state: geolocationState, enable: enableGeolocation } = useGeolocation();

  // Yandex Maps API Key
  const YANDEX_MAPS_API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || '';

  // Load service types
  const { data: serviceTypes = [] } = useServiceTypes();

  const schema = z.object({
    description: z
      .string()
      .min(10, t('descriptionMin', { defaultValue: 'Description must be at least 10 characters' })),
    specialization: z.string().optional(),
    yearsOfExperience: z.number().min(0).max(100).optional(),
    address: z.string().min(1, t('addressRequired', { defaultValue: 'Address is required' })),
    regionId: z.string().min(1, t('regionRequired', { defaultValue: 'Region is required' })),
    communityId: z
      .string()
      .min(1, t('communityRequired', { defaultValue: 'Community is required' })),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    phoneNumber: commonValidations.phoneRequired(
      t('phoneRequired', { defaultValue: 'Phone number is required' }),
      t('invalidPhoneNumber', {
        defaultValue:
          'Phone number must be 8 digits (e.g., 98222680) or 9 digits starting with 0 (e.g., 098222680)',
      })
    ),
    maxVisitsPerDay: z.number().min(1).max(50),
    serviceTypes: z
      .array(z.string())
      .min(1, t('serviceTypesRequired', { defaultValue: 'Select at least one service type' })),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: '',
      specialization: '',
      yearsOfExperience: undefined,
      address: '',
      regionId: '',
      communityId: '',
      latitude: 40.1811, // Default to Yerevan
      longitude: 44.5136,
      phoneNumber: '',
      maxVisitsPerDay: 10,
      serviceTypes: [],
    },
  });

  const watchedLatitude = watch('latitude');
  const watchedLongitude = watch('longitude');
  const watchedAddress = watch('address');

  // Handle reverse geocoding (coordinates → address only)
  const handleReverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      setIsReverseGeocoding(true);
      try {
        // Get address from backend API (Nominatim) - returns address, addressHy, addressRu
        const addressResult = await locationsService.reverseGeocodeAddress(lat, lng, locale);
        if (addressResult && addressResult.address) {
          setValue('address', addressResult.address, { shouldValidate: true });
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        showToast(t('geocodingError', { defaultValue: 'Failed to find address' }), 'error');
      } finally {
        setIsReverseGeocoding(false);
      }
    },
    [locale, setValue, t, showToast]
  );

  // Update map center when coordinates change
  useEffect(() => {
    if (watchedLatitude && watchedLongitude) {
      setMapCenter([watchedLatitude, watchedLongitude]);
    }
  }, [watchedLatitude, watchedLongitude]);

  // Reset community when region changes
  useEffect(() => {
    if (selectedRegionId) {
      _setSelectedCommunityId('');
      setValue('communityId', '', { shouldValidate: false });
    }
  }, [selectedRegionId, setValue]);

  // Handle geolocation success
  useEffect(() => {
    if (geolocationState.isEnabled && geolocationState.latitude && geolocationState.longitude) {
      setValue('latitude', geolocationState.latitude, { shouldValidate: true });
      setValue('longitude', geolocationState.longitude, { shouldValidate: true });
      setMapCenter([geolocationState.latitude, geolocationState.longitude]);
      // Reverse geocode to fill address
      handleReverseGeocode(geolocationState.latitude, geolocationState.longitude);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geolocationState.isEnabled, geolocationState.latitude, geolocationState.longitude]);

  // Use custom hook for create profile mutation (SOLID - Single Responsibility)
  const createMutation = useCreateProfile();

  const onSubmit = useCallback(
    (data: FormData) => {
      // Format phone number for backend (add +374 prefix)
      // Default working hours (Monday-Friday: 09:00-18:00, Saturday: 10:00-16:00, Sunday: closed)
      const defaultWorkingHours = {
        monday: { start: '09:00', end: '18:00', isOpen: true },
        tuesday: { start: '09:00', end: '18:00', isOpen: true },
        wednesday: { start: '09:00', end: '18:00', isOpen: true },
        thursday: { start: '09:00', end: '18:00', isOpen: true },
        friday: { start: '09:00', end: '18:00', isOpen: true },
        saturday: { start: '10:00', end: '16:00', isOpen: true },
        sunday: { isOpen: false },
      };

      const formattedData = {
        ...data,
        phoneNumber: formatPhoneForBackend(data.phoneNumber),
        workingHours: defaultWorkingHours,
        // Include photo file IDs if uploaded
        profilePhotoFileIds: profilePhotoFileIds.length > 0 ? profilePhotoFileIds : undefined,
        workPhotoFileIds: workPhotoFileIds.length > 0 ? workPhotoFileIds : undefined,
      };

      createMutation.mutate(formattedData, {
        onSuccess: async () => {
          // Invalidate and refetch branch to show the newly created branch
          await queryClient.refetchQueries({ queryKey: ['providerBranch'] });
          queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        },
      });
    },
    [createMutation, queryClient, profilePhotoFileIds, workPhotoFileIds]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          {t('createTitle', { defaultValue: 'Create Profile' })}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('createDescription', {
            defaultValue: 'Fill out the form below to create your auto service profile.',
          })}
        </p>
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

      {/* Location Section - Map Only */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2 dark:border-gray-700">
          <MapPin className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('location', { defaultValue: 'Location' })}
          </h3>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('locationHint', {
            defaultValue:
              'Click on the map to select your location. Address and coordinates will be filled automatically.',
          })}
        </p>

        {/* Map Picker - Always Visible */}
        {mounted && YANDEX_MAPS_API_KEY && (
          <div className="h-96 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <YMaps
              query={{
                apikey: YANDEX_MAPS_API_KEY,
                lang: (locale === 'hy' ? 'hy_AM' : locale === 'ru' ? 'ru_RU' : 'en_US') as
                  | 'ru_RU'
                  | 'en_US'
                  | 'tr_TR'
                  | 'en_RU'
                  | 'ru_UA'
                  | 'uk_UA'
                  | undefined,
              }}
            >
              <YMap
                defaultState={{
                  center:
                    watchedLatitude && watchedLongitude
                      ? [watchedLatitude, watchedLongitude]
                      : mapCenter,
                  zoom: 13,
                }}
                width="100%"
                height="100%"
                modules={['control.ZoomControl']}
                options={{
                  suppressMapOpenBlock: true,
                }}
                onClick={(e: ymaps.IEvent) => {
                  const coords = e.get('coords');
                  if (coords && Array.isArray(coords) && coords.length >= 2) {
                    const [lat, lng] = coords;
                    setValue('latitude', lat, { shouldValidate: true });
                    setValue('longitude', lng, { shouldValidate: true });
                    setMapCenter([lat, lng]);
                    // Automatically reverse geocode to fill address and detect location
                    handleReverseGeocode(lat, lng);
                  }
                }}
              >
                {watchedLatitude && watchedLongitude && (
                  <Placemark
                    geometry={[watchedLatitude, watchedLongitude]}
                    options={{
                      preset: 'islands#blueIcon',
                      iconColor: '#3b82f6',
                    }}
                  />
                )}
              </YMap>
            </YMaps>
          </div>
        )}
        {mounted && !YANDEX_MAPS_API_KEY && (
          <div className="flex h-96 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            <div className="p-4 text-center">
              <MapPin className="mx-auto mb-2 h-12 w-12 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('mapApiKeyRequired', { defaultValue: 'Yandex Maps API key is required' })}
              </p>
            </div>
          </div>
        )}

        {/* Use My Location Button */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={enableGeolocation}
            disabled={geolocationState.isLoading}
            className="flex items-center gap-2"
          >
            {geolocationState.isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('gettingLocation', { defaultValue: 'Getting location...' })}
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4" />
                {t('useMyLocation', { defaultValue: 'Use My Current Location' })}
              </>
            )}
          </Button>
        </div>

        {/* Address - Autocomplete */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('address', { defaultValue: 'Address' })} *
          </label>
          <AddressAutocomplete
            value={watchedAddress || ''}
            onChange={(address) => {
              setValue('address', address, { shouldValidate: true });
            }}
            onSelect={(suggestion) => {
              // When user selects an address, update coordinates
              setValue('latitude', suggestion.latitude, { shouldValidate: true });
              setValue('longitude', suggestion.longitude, { shouldValidate: true });
              setMapCenter([suggestion.latitude, suggestion.longitude]);
            }}
            placeholder={t('enterAddress', { defaultValue: 'Enter address or click on map...' })}
            disabled={false}
            className="w-full"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t('addressHint', {
              defaultValue:
                'Start typing to search for addresses, or click on the map to select a location',
            })}
          </p>
          {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
        </div>

        {/* Coordinates - Read Only (Auto-filled from map) */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('coordinates', { defaultValue: 'Coordinates' })} *
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
              <span className="text-xs text-gray-500 dark:text-gray-400">Latitude:</span>{' '}
              {watchedLatitude !== undefined && watchedLatitude !== null ? (
                watchedLatitude.toFixed(6)
              ) : (
                <span className="italic text-gray-400 dark:text-gray-500">
                  {t('notSet', { defaultValue: 'Not set' })}
                </span>
              )}
            </div>
            <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
              <span className="text-xs text-gray-500 dark:text-gray-400">Longitude:</span>{' '}
              {watchedLongitude !== undefined && watchedLongitude !== null ? (
                watchedLongitude.toFixed(6)
              ) : (
                <span className="italic text-gray-400 dark:text-gray-500">
                  {t('notSet', { defaultValue: 'Not set' })}
                </span>
              )}
            </div>
          </div>
          {errors.latitude && (
            <p className="mt-1 text-sm text-red-600">{errors.latitude.message}</p>
          )}
          {errors.longitude && (
            <p className="mt-1 text-sm text-red-600">{errors.longitude.message}</p>
          )}
        </div>

        {/* Region Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('region', { defaultValue: 'Region' })} *
          </label>
          <Controller
            name="regionId"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  setSelectedRegionId(e.target.value);
                  setValue('communityId', '', { shouldValidate: false });
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="">{t('selectRegion', { defaultValue: 'Select Region' })}</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.regionId && (
            <p className="mt-1 text-sm text-red-600">{errors.regionId.message}</p>
          )}
        </div>

        {/* Community Selection (City/Village/District) */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('community', { defaultValue: 'Community' })} *
          </label>
          <Controller
            name="communityId"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  _setSelectedCommunityId(e.target.value);
                }}
                disabled={!selectedRegionId}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="">
                  {selectedRegionId
                    ? t('selectCommunity', { defaultValue: 'Select Community' })
                    : t('selectRegionFirst', { defaultValue: 'Select Region first' })}
                </option>
                {communities.map((community) => (
                  <option key={community.id} value={community.id}>
                    {community.name} ({community.type})
                  </option>
                ))}
              </select>
            )}
          />
          {errors.communityId && (
            <p className="mt-1 text-sm text-red-600">{errors.communityId.message}</p>
          )}
        </div>

        {isReverseGeocoding && (
          <p className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            {t('findingAddress', { defaultValue: 'Finding address...' })}
          </p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('phoneNumber', { defaultValue: 'Phone Number' })} *
        </label>
        <Controller
          name="phoneNumber"
          control={control}
          render={({ field }) => (
            <PhoneInput
              value={field.value}
              onChange={field.onChange}
              error={errors.phoneNumber?.message}
            />
          )}
        />
      </div>

      {/* Max Visits Per Day */}
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

      {/* Service Types */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('serviceTypes', { defaultValue: 'Service Types' })} *
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {serviceTypes.map((serviceType) => {
            // Use displayName if available (from useServiceTypes hook), otherwise fallback to name
            const displayName = serviceType.displayName || serviceType.name;
            return (
              <label
                key={serviceType.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 p-3 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                <input
                  type="checkbox"
                  value={serviceType.id}
                  {...register('serviceTypes')}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{displayName}</span>
              </label>
            );
          })}
        </div>
        {errors.serviceTypes && (
          <p className="mt-1 text-sm text-red-600">{errors.serviceTypes.message}</p>
        )}
      </div>

      {/* Profile Photos */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('profilePhotos', { defaultValue: 'Profile Photos' })}
        </label>
        <FileUpload
          accept="image/*"
          maxSize={10}
          maxFiles={10}
          multiple={true}
          label={t('uploadProfilePhotos', { defaultValue: 'Upload Profile Photos' })}
          existingFiles={profilePhotoFiles}
          category={FILE_CATEGORIES.PROFILE_PHOTOS}
          inputId="profile-photos-upload-input"
          onUpload={(files) => {
            const newFileIds = files.map((f) => f.id);
            setProfilePhotoFileIds((prev) => [...prev, ...newFileIds]);
            setProfilePhotoFiles((prev) => [...prev, ...files]);
          }}
          onRemove={(fileId) => {
            setProfilePhotoFileIds((prev) => prev.filter((id) => id !== fileId));
            setProfilePhotoFiles((prev) => prev.filter((f) => f.id !== fileId));
          }}
          disabled={isSubmitting || createMutation.isPending}
        />
      </div>

      {/* Work Photos */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('workPhotos', { defaultValue: 'Work Photos' })}
        </label>
        <FileUpload
          accept="image/*"
          maxSize={10}
          maxFiles={20}
          multiple={true}
          label={t('uploadWorkPhotos', { defaultValue: 'Upload Work Photos' })}
          existingFiles={workPhotoFiles}
          category={FILE_CATEGORIES.WORK_PHOTOS}
          inputId="work-photos-upload-input"
          onUpload={(files) => {
            const newFileIds = files.map((f) => f.id);
            setWorkPhotoFileIds((prev) => [...prev, ...newFileIds]);
            setWorkPhotoFiles((prev) => [...prev, ...files]);
          }}
          onRemove={(fileId) => {
            setWorkPhotoFileIds((prev) => prev.filter((id) => id !== fileId));
            setWorkPhotoFiles((prev) => prev.filter((f) => f.id !== fileId));
          }}
          disabled={isSubmitting || createMutation.isPending}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting || createMutation.isPending}
        >
          {t('create', { defaultValue: 'Create Profile' })}
        </Button>
      </div>
    </form>
  );
}
