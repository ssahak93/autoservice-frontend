'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import L from 'leaflet';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';

// Fix for default marker icons (must be done before importing MapContainer)
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

// Dynamically import MapContainer to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), {
  ssr: false,
});
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), {
  ssr: false,
});
const ZoomControl = dynamic(() => import('react-leaflet').then((mod) => mod.ZoomControl), {
  ssr: false,
});

import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useServiceTypes } from '@/hooks/useServiceTypes';
// Location fields (region, city, district) are now filled by admin, not by user
import { autoServiceProfileService } from '@/lib/services/auto-service-profile.service';
import { type UploadedFile } from '@/lib/services/files.service';
import { geocodingService } from '@/lib/services/geocoding.service';
import { getCurrentLocale } from '@/lib/utils/i18n';
import { PHONE_PATTERN, PHONE_ERROR_MESSAGE, formatPhoneForBackend } from '@/lib/utils/phone.util';
import { useAutoServiceStore } from '@/stores/autoServiceStore';
import { useUIStore } from '@/stores/uiStore';

import { LocationPicker } from './LocationPicker';

export function CreateProfileEditor() {
  const t = useTranslations('myService.profile');
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();
  const { selectedAutoServiceId } = useAutoServiceStore();
  const locale = getCurrentLocale();
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.1811, 44.5136]); // Yerevan default
  const [mounted, setMounted] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Photo upload state (similar to admin)
  const [profilePhotoFiles, setProfilePhotoFiles] = useState<UploadedFile[]>([]);
  const [workPhotoFiles, setWorkPhotoFiles] = useState<UploadedFile[]>([]);
  const [profilePhotoFileIds, setProfilePhotoFileIds] = useState<string[]>([]);
  const [workPhotoFileIds, setWorkPhotoFileIds] = useState<string[]>([]);

  // Geolocation hook
  const { state: geolocationState, enable: enableGeolocation } = useGeolocation();

  useEffect(() => {
    setMounted(true);

    // Cleanup: remove map instance when component unmounts
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Load service types
  const { data: serviceTypes = [] } = useServiceTypes();

  const schema = z.object({
    description: z
      .string()
      .min(10, t('descriptionMin', { defaultValue: 'Description must be at least 10 characters' })),
    specialization: z.string().optional(),
    yearsOfExperience: z.number().min(0).max(100).optional(),
    address: z.string().min(1, t('addressRequired', { defaultValue: 'Address is required' })),
    // city, region, district are no longer required - will be filled by admin
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    phoneNumber: z
      .string()
      .min(1, t('phoneRequired', { defaultValue: 'Phone number is required' }))
      .regex(PHONE_PATTERN, t('invalidPhoneNumber', { defaultValue: PHONE_ERROR_MESSAGE })),
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

  // Handle reverse geocoding (coordinates → address)
  // Only fills address, not city/region/district (those are filled by admin)
  const handleReverseGeocode = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const result = await geocodingService.reverseGeocode(lat, lng, locale);
      if (result && result.address) {
        // Only fill address - city/region/district will be filled by admin
        setValue('address', result.address, { shouldValidate: true });
        showToast(t('addressFound', { defaultValue: 'Address filled automatically' }), 'success');
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      showToast(t('geocodingError', { defaultValue: 'Failed to find address' }), 'error');
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Update map center when coordinates change
  useEffect(() => {
    if (watchedLatitude && watchedLongitude) {
      setMapCenter([watchedLatitude, watchedLongitude]);
    }
  }, [watchedLatitude, watchedLongitude]);

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

  const createMutation = useMutation({
    mutationFn: (data: FormData) => {
      // Format phone number for backend (add +374 prefix)
      // Note: city, region, district are not in FormData (filled by admin, not sent by user)
      const profileData = data;

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
        ...profileData,
        phoneNumber: formatPhoneForBackend(data.phoneNumber),
        workingHours: defaultWorkingHours,
        // Include photo file IDs if uploaded
        profilePhotoFileIds: profilePhotoFileIds.length > 0 ? profilePhotoFileIds : undefined,
        workPhotoFileIds: workPhotoFileIds.length > 0 ? workPhotoFileIds : undefined,
      };
      return autoServiceProfileService.createProfile(
        formattedData,
        selectedAutoServiceId || undefined
      );
    },
    onSuccess: async () => {
      // Invalidate and refetch profile to show the newly created profile
      await queryClient.refetchQueries({ queryKey: ['autoServiceProfile'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      showToast(t('createSuccess', { defaultValue: 'Profile created successfully' }), 'success');
    },
    onError: (error: Error) => {
      showToast(
        error.message || t('createError', { defaultValue: 'Failed to create profile' }),
        'error'
      );
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

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
        {mounted && (
          <div
            id="map-container"
            className="h-96 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <MapContainer
              key="map-instance"
              center={
                watchedLatitude && watchedLongitude
                  ? [watchedLatitude, watchedLongitude]
                  : mapCenter
              }
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
              whenCreated={(map) => {
                // Store map instance and clean up previous one if exists
                if (mapInstanceRef.current && mapInstanceRef.current !== map) {
                  try {
                    mapInstanceRef.current.remove();
                  } catch (e) {
                    // Map already removed, ignore
                  }
                }
                mapInstanceRef.current = map;
              }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ZoomControl position="bottomright" />
              <LocationPicker
                onLocationSelect={(lat, lng) => {
                  setValue('latitude', lat, { shouldValidate: true });
                  setValue('longitude', lng, { shouldValidate: true });
                  setMapCenter([lat, lng]);
                  // Automatically reverse geocode to fill address
                  handleReverseGeocode(lat, lng);
                }}
              />
              {watchedLatitude && watchedLongitude && (
                <Marker position={[watchedLatitude, watchedLongitude]} />
              )}
            </MapContainer>
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

        {/* Address - Read Only (Auto-filled from map) */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('address', { defaultValue: 'Address' })} *
          </label>
          <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
            {watchedAddress || (
              <span className="italic text-gray-400 dark:text-gray-500">
                {t('addressWillBeFilled', {
                  defaultValue:
                    'Address will be filled automatically when you select a location on the map',
                })}
              </span>
            )}
          </div>
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
          category="profile-photo"
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
          category="work-photo"
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
