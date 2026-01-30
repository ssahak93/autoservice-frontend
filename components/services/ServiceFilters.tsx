'use client';

import { MapPin, SlidersHorizontal, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useRef, useCallback } from 'react';

import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useDebounce } from '@/hooks/useDebounce';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useRegions, useCommunities } from '@/hooks/useLocations';
import { useServiceTypes } from '@/hooks/useServiceTypes';
import type { ServiceSearchParams } from '@/lib/services/services.service';

interface ServiceFiltersProps {
  filters: ServiceSearchParams;
  onFiltersChange: (filters: ServiceSearchParams) => void;
}

/**
 * ServiceFilters Component
 *
 * Single Responsibility: Only handles filter UI and state management
 * Dependency Inversion: Uses hooks for business logic (geolocation, service types)
 */
export function ServiceFilters({ filters, onFiltersChange }: ServiceFiltersProps) {
  const t = useTranslations('services');
  const [localFilters, setLocalFilters] = useState<ServiceSearchParams>(filters);
  const debouncedFilters = useDebounce(localFilters, 500);
  const geolocation = useGeolocation();
  const isInternalUpdateRef = useRef(false);
  const lastDebouncedValueRef = useRef<string>('');

  const { data: serviceTypes, isLoading: serviceTypesLoading } = useServiceTypes();
  const { data: regions } = useRegions();
  const { data: communities } = useCommunities(localFilters.regionId);

  // Sync local filters with external filters (only if not internal update)
  useEffect(() => {
    if (!isInternalUpdateRef.current) {
      // Deep comparison to avoid unnecessary updates
      const currentSerialized = JSON.stringify(localFilters);
      const newSerialized = JSON.stringify(filters);
      if (currentSerialized !== newSerialized) {
        setLocalFilters(filters);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Auto-apply filters after debounce (only if changed)
  useEffect(() => {
    const debouncedSerialized = JSON.stringify(debouncedFilters);
    if (debouncedSerialized !== lastDebouncedValueRef.current) {
      lastDebouncedValueRef.current = debouncedSerialized;
      isInternalUpdateRef.current = true;
      onFiltersChange(debouncedFilters);
      // Reset flag after update
      requestAnimationFrame(() => {
        isInternalUpdateRef.current = false;
      });
    }
  }, [debouncedFilters, onFiltersChange]);

  // Sync geolocation with filters
  useEffect(() => {
    if (geolocation.state.isEnabled && geolocation.state.latitude && geolocation.state.longitude) {
      isInternalUpdateRef.current = true;
      setLocalFilters((prev) => ({
        ...prev,
        latitude: geolocation.state.latitude,
        longitude: geolocation.state.longitude,
        page: 1,
      }));
      requestAnimationFrame(() => {
        isInternalUpdateRef.current = false;
      });
    } else if (!geolocation.state.isEnabled) {
      isInternalUpdateRef.current = true;
      setLocalFilters((prev) => {
        if (prev.latitude || prev.longitude) {
          return {
            ...prev,
            latitude: undefined,
            longitude: undefined,
            radius: undefined,
            page: 1,
          };
        }
        return prev;
      });
      requestAnimationFrame(() => {
        isInternalUpdateRef.current = false;
      });
    }
  }, [geolocation.state.isEnabled, geolocation.state.latitude, geolocation.state.longitude]);

  const handleChange = useCallback(
    (key: keyof ServiceSearchParams, value: string | number | undefined) => {
      isInternalUpdateRef.current = true;
      const newFilters = { ...localFilters, [key]: value || undefined, page: 1 };
      setLocalFilters(newFilters);
      requestAnimationFrame(() => {
        isInternalUpdateRef.current = false;
      });
    },
    [localFilters]
  );

  const handleReset = () => {
    const resetFilters: ServiceSearchParams = { page: 1, limit: 20, sortBy: 'rating' };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    geolocation.disable();
  };

  const handleLocationToggle = () => {
    geolocation.toggle();
  };

  const sortOptions = [
    { value: 'rating', label: t('sortBy.rating'), key: 'sort-rating' },
    { value: 'distance', label: t('sortBy.distance'), key: 'sort-distance' },
    { value: 'reviews', label: t('sortBy.reviews'), key: 'sort-reviews' },
    { value: 'newest', label: t('sortBy.newest'), key: 'sort-newest' },
  ];

  const radiusOptions = [
    { value: '5', label: '5 km', key: 'radius-5' },
    { value: '10', label: '10 km', key: 'radius-10' },
    { value: '25', label: '25 km', key: 'radius-25' },
    { value: '50', label: '50 km', key: 'radius-50' },
    { value: '100', label: '100 km', key: 'radius-100' },
  ];

  const serviceTypeOptions = serviceTypes
    ? [
        { value: '', label: t('allServiceTypes') },
        ...serviceTypes.map((type, index) => ({
          value: type.id,
          label: type.displayName || type.name,
          key: `serviceType-${type.id}-${index}`,
        })),
      ]
    : [{ value: '', label: t('loading') }];

  const hasActiveFilters =
    localFilters.businessType ||
    localFilters.regionId ||
    localFilters.communityId ||
    localFilters.serviceType ||
    localFilters.minRating ||
    geolocation.state.isEnabled ||
    localFilters.sortBy !== 'rating';

  return (
    <div className="glass-light rounded-xl p-4 sm:p-6">
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
        {/* Region Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">{t('region')}</label>
          <Select
            value={localFilters.regionId || ''}
            onChange={(e) => {
              handleChange('regionId', e.target.value || undefined);
              // Reset community when region changes
              if (e.target.value !== localFilters.regionId) {
                handleChange('communityId', undefined);
              }
            }}
            options={[
              { value: '', label: t('allRegions', { defaultValue: 'All Regions' }) },
              ...(regions || []).map((region, index) => ({
                value: region.id,
                label: region.name,
                key: `region-${region.id}-${index}`,
              })),
            ]}
          />
        </div>

        {/* Community Filter (City/Village/District) */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            {t('community', { defaultValue: 'Community' })}
          </label>
          <Select
            value={localFilters.communityId || ''}
            onChange={(e) => handleChange('communityId', e.target.value || undefined)}
            options={[
              { value: '', label: t('allCommunities', { defaultValue: 'All Communities' }) },
              ...(communities || []).map((community, index) => ({
                value: community.id,
                label: `${community.name} (${community.type})`,
                key: `community-${community.id}-${index}`,
              })),
            ]}
            disabled={!localFilters.regionId}
          />
        </div>

        {/* Business Type Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            {t('businessType', { defaultValue: 'Business Type' })}
          </label>
          <Select
            value={localFilters.businessType || ''}
            onChange={(e) => handleChange('businessType', e.target.value || undefined)}
            options={[
              { value: '', label: t('allBusinessTypes', { defaultValue: 'All Types' }) },
              {
                value: 'auto_service',
                label: t('businessTypes.auto_service', { defaultValue: 'Auto Service' }),
                key: 'bt-auto_service',
              },
              {
                value: 'auto_shop',
                label: t('businessTypes.auto_shop', { defaultValue: 'Auto Shop' }),
                key: 'bt-auto_shop',
              },
              {
                value: 'car_wash',
                label: t('businessTypes.car_wash', { defaultValue: 'Car Wash' }),
                key: 'bt-car_wash',
              },
              {
                value: 'cleaning',
                label: t('businessTypes.cleaning', { defaultValue: 'Cleaning' }),
                key: 'bt-cleaning',
              },
              {
                value: 'tire_service',
                label: t('businessTypes.tire_service', { defaultValue: 'Tire Service' }),
                key: 'bt-tire_service',
              },
              {
                value: 'towing',
                label: t('businessTypes.towing', { defaultValue: 'Towing' }),
                key: 'bt-towing',
              },
              {
                value: 'tinting',
                label: t('businessTypes.tinting', { defaultValue: 'Tinting' }),
                key: 'bt-tinting',
              },
              {
                value: 'other',
                label: t('businessTypes.other', { defaultValue: 'Other' }),
                key: 'bt-other',
              },
            ]}
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
          <label className="mb-2 block text-sm font-medium text-neutral-700">{t('location')}</label>
          <Button
            type="button"
            variant={geolocation.state.isEnabled ? 'primary' : 'outline'}
            size="sm"
            onClick={handleLocationToggle}
            disabled={geolocation.state.isLoading}
            className="w-full"
          >
            <MapPin className="h-4 w-4" />
            {geolocation.state.isLoading
              ? t('loading', { defaultValue: 'Loading...' })
              : geolocation.state.isEnabled
                ? t('locationEnabled')
                : t('useMyLocation')}
          </Button>
          {geolocation.state.error && (
            <p className="mt-1 text-xs text-error-600">
              {geolocation.state.error === 'Location permission denied'
                ? t('locationPermissionDenied')
                : geolocation.state.error === 'Geolocation is not supported by your browser'
                  ? t('locationNotSupported')
                  : t('locationError')}
            </p>
          )}
          {geolocation.state.isEnabled &&
            geolocation.state.accuracy &&
            geolocation.state.accuracy > 1000 && (
              <p className="mt-1 text-xs text-warning-600">
                {t('lowAccuracyWarning', {
                  accuracy: (geolocation.state.accuracy / 1000).toFixed(1),
                })}
              </p>
            )}
          {geolocation.state.isEnabled && (
            <div className="mt-2">
              <label className="mb-1 block text-xs text-neutral-600">{t('radius')}</label>
              <Select
                value={localFilters.radius?.toString() || '50'}
                onChange={(e) =>
                  handleChange('radius', e.target.value ? parseInt(e.target.value) : undefined)
                }
                options={radiusOptions}
              />
            </div>
          )}
        </div>

        {/* Sort By */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            {t('sortBy.label')}
          </label>
          <Select
            value={localFilters.sortBy || 'rating'}
            onChange={(e) =>
              handleChange('sortBy', e.target.value as ServiceSearchParams['sortBy'])
            }
            options={sortOptions}
          />
        </div>
      </div>
    </div>
  );
}
