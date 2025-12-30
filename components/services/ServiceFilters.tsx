'use client';

import { MapPin, SlidersHorizontal, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useDebounce } from '@/hooks/useDebounce';
import { useServiceTypes } from '@/hooks/useServiceTypes';
import type { ServiceSearchParams } from '@/lib/services/services.service';

interface ServiceFiltersProps {
  filters: ServiceSearchParams;
  onFiltersChange: (filters: ServiceSearchParams) => void;
}

export function ServiceFilters({ filters, onFiltersChange }: ServiceFiltersProps) {
  const t = useTranslations('services');
  const [localFilters, setLocalFilters] = useState<ServiceSearchParams>(filters);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const debouncedFilters = useDebounce(localFilters, 500);

  const { data: serviceTypes, isLoading: serviceTypesLoading } = useServiceTypes();

  // Auto-apply filters after debounce
  useEffect(() => {
    onFiltersChange(debouncedFilters);
  }, [debouncedFilters, onFiltersChange]);

  const handleChange = (key: keyof ServiceSearchParams, value: string | number | undefined) => {
    const newFilters = { ...localFilters, [key]: value || undefined, page: 1 };
    setLocalFilters(newFilters);
  };

  const handleReset = () => {
    const resetFilters: ServiceSearchParams = { page: 1, limit: 20 };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    setIsLocationEnabled(false);
    setLocationError(null);
  };

  const handleLocationToggle = () => {
    if (isLocationEnabled) {
      // Disable location
      setIsLocationEnabled(false);
      setLocationError(null);
      const newFilters = { ...localFilters, latitude: undefined, longitude: undefined, page: 1 };
      setLocalFilters(newFilters);
      onFiltersChange(newFilters);
    } else {
      // Enable location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setIsLocationEnabled(true);
            setLocationError(null);
            const newFilters = {
              ...localFilters,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              page: 1,
            };
            setLocalFilters(newFilters);
            onFiltersChange(newFilters);
          },
          (error) => {
            setIsLocationEnabled(false);
            setLocationError(
              error.code === error.PERMISSION_DENIED
                ? t('locationPermissionDenied')
                : t('locationError')
            );
          }
        );
      } else {
        setLocationError(t('locationNotSupported'));
      }
    }
  };

  const sortOptions = [
    { value: 'rating', label: t('sortBy.rating') },
    { value: 'distance', label: t('sortBy.distance') },
    { value: 'reviews', label: t('sortBy.reviews') },
    { value: 'newest', label: t('sortBy.newest') },
  ];

  const radiusOptions = [
    { value: '5', label: '5 km' },
    { value: '10', label: '10 km' },
    { value: '25', label: '25 km' },
    { value: '50', label: '50 km' },
    { value: '100', label: '100 km' },
  ];

  const serviceTypeOptions = serviceTypes
    ? [
        { value: '', label: t('allServiceTypes') },
        ...serviceTypes.map((type) => ({
          value: type.id,
          label: type.displayName || type.name,
        })),
      ]
    : [{ value: '', label: t('loading') }];

  const hasActiveFilters =
    localFilters.city ||
    localFilters.region ||
    localFilters.serviceType ||
    localFilters.minRating ||
    localFilters.latitude ||
    localFilters.sortBy !== 'rating';

  return (
    <div className="glass-light rounded-xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary-600" />
          <h3 className="font-display text-lg font-semibold">{t('filters')}</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-sm text-primary-600 transition-colors hover:text-primary-700"
            aria-label={t('resetFilters')}
          >
            <X className="h-4 w-4" />
            {t('reset')}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* City Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">{t('city')}</label>
          <Input
            placeholder={t('enterCity')}
            value={localFilters.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
          />
        </div>

        {/* Region Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">{t('region')}</label>
          <Input
            placeholder={t('enterRegion')}
            value={localFilters.region || ''}
            onChange={(e) => handleChange('region', e.target.value)}
          />
        </div>

        {/* Service Type Filter */}
        <Select
          label={t('serviceType')}
          value={localFilters.serviceType || ''}
          onChange={(e) => handleChange('serviceType', e.target.value || undefined)}
          options={serviceTypeOptions}
          disabled={serviceTypesLoading}
        />

        {/* Minimum Rating */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            {t('minRating')} ({localFilters.minRating || 0})
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={localFilters.minRating || 0}
            onChange={(e) =>
              handleChange('minRating', e.target.value ? parseFloat(e.target.value) : undefined)
            }
            className="w-full"
          />
          <div className="mt-1 flex justify-between text-xs text-neutral-500">
            <span>0</span>
            <span>5</span>
          </div>
        </div>

        {/* Location-based Search */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            {t('location')}
          </label>
          <Button
            type="button"
            variant={isLocationEnabled ? 'primary' : 'outline'}
            size="sm"
            onClick={handleLocationToggle}
            className="w-full"
          >
            <MapPin className="h-4 w-4" />
            {isLocationEnabled ? t('locationEnabled') : t('useMyLocation')}
          </Button>
          {locationError && (
            <p className="mt-1 text-xs text-error-600">{locationError}</p>
          )}
          {isLocationEnabled && (
            <div className="mt-2">
              <label className="mb-1 block text-xs text-neutral-600">{t('radius')}</label>
              <Select
                value={localFilters.radius?.toString() || '50'}
                onChange={(e) => handleChange('radius', e.target.value ? parseInt(e.target.value) : undefined)}
                options={radiusOptions}
              />
            </div>
          )}
        </div>

        {/* Sort By */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">{t('sortBy.label')}</label>
          <Select
            value={localFilters.sortBy || 'rating'}
            onChange={(e) => handleChange('sortBy', e.target.value as ServiceSearchParams['sortBy'])}
            options={sortOptions}
          />
        </div>
      </div>
    </div>
  );
}
