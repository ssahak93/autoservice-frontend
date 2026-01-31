'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp, MapPin, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';

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

const BUSINESS_TYPES = [
  { value: 'auto_service', labelKey: 'businessTypes.auto_service', defaultLabel: 'Auto Service' },
  { value: 'auto_shop', labelKey: 'businessTypes.auto_shop', defaultLabel: 'Auto Shop' },
  { value: 'car_wash', labelKey: 'businessTypes.car_wash', defaultLabel: 'Car Wash' },
  { value: 'cleaning', labelKey: 'businessTypes.cleaning', defaultLabel: 'Cleaning' },
  { value: 'tire_service', labelKey: 'businessTypes.tire_service', defaultLabel: 'Tire Service' },
  { value: 'towing', labelKey: 'businessTypes.towing', defaultLabel: 'Towing' },
  { value: 'tinting', labelKey: 'businessTypes.tinting', defaultLabel: 'Tinting' },
  { value: 'other', labelKey: 'businessTypes.other', defaultLabel: 'Other' },
] as const;

/**
 * ServiceFilters Component
 *
 * Single Responsibility: Only handles filter UI and state management
 * Dependency Inversion: Uses hooks for business logic (geolocation, service types)
 * Enhanced UI/UX with checkboxes, collapsible sections, and better visual feedback
 */
export function ServiceFilters({ filters, onFiltersChange }: ServiceFiltersProps) {
  const t = useTranslations('services');
  const [localFilters, setLocalFilters] = useState<ServiceSearchParams>(filters);
  const debouncedFilters = useDebounce(localFilters, 500);
  const geolocation = useGeolocation();
  const isInternalUpdateRef = useRef(false);
  const lastDebouncedValueRef = useRef<string>('');

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    businessType: true,
    serviceType: true,
    rating: true,
    sort: true,
  });

  const { data: serviceTypes, isLoading: serviceTypesLoading } = useServiceTypes();
  const { data: regions } = useRegions();
  // Fetch communities based on selected region
  // Use filters.regionId (from URL) as source of truth, not localFilters
  // This ensures communities update correctly when region changes
  const { data: communities } = useCommunities(filters.regionId || localFilters.regionId);

  // Get current selected values (arrays for multiple selection)
  const selectedBusinessTypes = useMemo(
    () => localFilters.businessTypes || [],
    [localFilters.businessTypes]
  );
  const selectedServiceTypes = useMemo(
    () => localFilters.serviceTypes || [],
    [localFilters.serviceTypes]
  );

  // Sync local filters with external filters (only if not internal update)
  // IMPORTANT: Initialize lastDebouncedValueRef to prevent initial onFiltersChange call
  useEffect(() => {
    if (lastDebouncedValueRef.current === '') {
      // First render - initialize ref to prevent initial onFiltersChange call
      lastDebouncedValueRef.current = JSON.stringify(filters);
    }
    if (!isInternalUpdateRef.current) {
      // Only sync if filters actually changed and localFilters is different
      // Compare arrays properly for businessTypes and serviceTypes
      const currentBusinessTypes = JSON.stringify(localFilters.businessTypes || []);
      const newBusinessTypes = JSON.stringify(filters.businessTypes || []);
      const currentServiceTypes = JSON.stringify(localFilters.serviceTypes || []);
      const newServiceTypes = JSON.stringify(filters.serviceTypes || []);

      const hasChanges =
        localFilters.regionId !== filters.regionId ||
        localFilters.communityId !== filters.communityId ||
        currentBusinessTypes !== newBusinessTypes ||
        currentServiceTypes !== newServiceTypes ||
        localFilters.minRating !== filters.minRating ||
        localFilters.sortBy !== filters.sortBy ||
        localFilters.latitude !== filters.latitude ||
        localFilters.longitude !== filters.longitude ||
        localFilters.radius !== filters.radius ||
        localFilters.query !== filters.query;

      if (hasChanges) {
        setLocalFilters(filters);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Auto-apply filters after debounce (only if changed)
  // IMPORTANT: Do NOT change page automatically - preserve URL page
  // IMPORTANT: Only call onFiltersChange if filters actually changed (not just query)
  useEffect(() => {
    const debouncedSerialized = JSON.stringify(debouncedFilters);
    if (debouncedSerialized !== lastDebouncedValueRef.current) {
      // Check if this is a real filter change (not just query change)
      // Query changes are handled by SearchBarEnhanced, not here
      const filtersChanged =
        debouncedFilters.regionId !== filters.regionId ||
        debouncedFilters.communityId !== filters.communityId ||
        JSON.stringify(debouncedFilters.businessTypes) !== JSON.stringify(filters.businessTypes) ||
        JSON.stringify(debouncedFilters.serviceTypes) !== JSON.stringify(filters.serviceTypes) ||
        debouncedFilters.minRating !== filters.minRating ||
        debouncedFilters.sortBy !== filters.sortBy ||
        debouncedFilters.latitude !== filters.latitude ||
        debouncedFilters.longitude !== filters.longitude ||
        debouncedFilters.radius !== filters.radius;

      // Only call onFiltersChange if filters actually changed (not just query)
      if (filtersChanged) {
        lastDebouncedValueRef.current = debouncedSerialized;
        isInternalUpdateRef.current = true;
        // Preserve current page from URL - don't reset to 1 automatically
        const filtersToApply = { ...debouncedFilters };
        // Remove page from filters if it was set to 1 automatically
        // This prevents automatic redirect to page 1
        if (filtersToApply.page === 1 && filters.page !== 1) {
          // Don't include page in filters if it's being reset automatically
          // Let URL page be preserved
          delete filtersToApply.page;
        }
        onFiltersChange(filtersToApply);
        // Don't reset isInternalUpdateRef here - let toggle handlers manage it
        // The toggle handlers will reset it after their timeout
      } else {
        // Just update ref to prevent future calls for same filters
        lastDebouncedValueRef.current = debouncedSerialized;
      }
    }
  }, [debouncedFilters, onFiltersChange, filters]);

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

  const handleBusinessTypeToggle = useCallback(
    (businessType: (typeof BUSINESS_TYPES)[number]['value']) => {
      isInternalUpdateRef.current = true;
      // Use functional update to ensure we have the latest state
      setLocalFilters((prev) => {
        const currentTypes = prev.businessTypes || [];
        const newTypes = currentTypes.includes(businessType)
          ? currentTypes.filter((bt) => bt !== businessType)
          : [...currentTypes, businessType];

        return {
          ...prev,
          businessTypes: newTypes.length > 0 ? newTypes : undefined,
          page: 1,
        };
      });
      // Keep isInternalUpdateRef true longer to prevent sync from overwriting changes
      // Reset after debounce completes (500ms) + URL update time (100ms) + buffer
      setTimeout(() => {
        isInternalUpdateRef.current = false;
      }, 800);
    },
    []
  );

  const handleServiceTypeToggle = useCallback((serviceTypeId: string) => {
    isInternalUpdateRef.current = true;
    // Use functional update to ensure we have the latest state
    setLocalFilters((prev) => {
      const currentTypes = prev.serviceTypes || [];
      const newTypes = currentTypes.includes(serviceTypeId)
        ? currentTypes.filter((st) => st !== serviceTypeId)
        : [...currentTypes, serviceTypeId];

      return {
        ...prev,
        serviceTypes: newTypes.length > 0 ? newTypes : undefined,
        page: 1,
      };
    });
    // Keep isInternalUpdateRef true longer to prevent sync from overwriting changes
    // Reset after debounce completes (500ms) + URL update time (100ms) + buffer
    setTimeout(() => {
      isInternalUpdateRef.current = false;
    }, 800);
  }, []);

  const handleChange = useCallback(
    (key: keyof ServiceSearchParams, value: string | number | undefined) => {
      isInternalUpdateRef.current = true;
      const newFilters = { ...localFilters, [key]: value || undefined, page: 1 };
      setLocalFilters(newFilters);
      // Keep isInternalUpdateRef true longer to prevent sync from overwriting changes
      // Reset after debounce completes (500ms + buffer)
      setTimeout(() => {
        isInternalUpdateRef.current = false;
      }, 600);
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

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
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

  const hasActiveFilters =
    selectedBusinessTypes.length > 0 ||
    selectedServiceTypes.length > 0 ||
    localFilters.regionId ||
    localFilters.communityId ||
    localFilters.minRating ||
    geolocation.state.isEnabled ||
    localFilters.sortBy !== 'rating';

  return (
    <div className="glass-light rounded-xl p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary-600" />
          <h3 className="font-display text-lg font-semibold text-neutral-900">{t('filters')}</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 hover:underline"
            aria-label={t('resetFilters')}
          >
            <X className="h-4 w-4" />
            {t('reset')}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* Location Section - Collapsible */}
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
          <button
            onClick={() => toggleSection('location')}
            className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              <MapPin className="h-4 w-4 text-primary-600" />
              {t('location', { defaultValue: 'Location' })}
            </span>
            {expandedSections.location ? (
              <ChevronUp className="h-4 w-4 text-neutral-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-neutral-500" />
            )}
          </button>
          <AnimatePresence>
            {expandedSections.location && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 border-t border-neutral-200 p-3 dark:border-neutral-700">
                  {/* Region Filter */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      {t('region')}
                    </label>
                    <Select
                      value={localFilters.regionId || ''}
                      onChange={(e) => {
                        const newRegionId = e.target.value || undefined;
                        const oldRegionId = localFilters.regionId;
                        // Update regionId and clear communityId if region changed
                        const newFilters: ServiceSearchParams = {
                          ...localFilters,
                          regionId: newRegionId,
                          communityId:
                            newRegionId !== oldRegionId ? undefined : localFilters.communityId,
                          page: 1,
                        };
                        isInternalUpdateRef.current = true;
                        setLocalFilters(newFilters);
                        setTimeout(() => {
                          isInternalUpdateRef.current = false;
                        }, 600);
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

                  {/* Community Filter */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      {t('community', { defaultValue: 'Community' })}
                    </label>
                    <Select
                      value={localFilters.communityId || ''}
                      onChange={(e) => handleChange('communityId', e.target.value || undefined)}
                      options={[
                        {
                          value: '',
                          label: t('allCommunities', { defaultValue: 'All Communities' }),
                        },
                        ...(communities && (localFilters.regionId || filters.regionId)
                          ? communities.map((community, index) => ({
                              value: community.id,
                              label: `${community.name} (${community.type})`,
                              key: `community-${community.id}-${index}`,
                            }))
                          : []),
                      ]}
                      disabled={!localFilters.regionId && !filters.regionId}
                    />
                  </div>

                  {/* Location-based Search */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      {t('useMyLocation', { defaultValue: 'Use My Location' })}
                    </label>
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
                          ? t('locationEnabled', { defaultValue: 'Location Enabled' })
                          : t('useMyLocation', { defaultValue: 'Use My Location' })}
                    </Button>
                    {geolocation.state.error && (
                      <p className="mt-1 text-xs text-error-600">
                        {geolocation.state.error === 'Location permission denied'
                          ? t('locationPermissionDenied')
                          : geolocation.state.error ===
                              'Geolocation is not supported by your browser'
                            ? t('locationNotSupported')
                            : t('locationError')}
                      </p>
                    )}
                    {geolocation.state.isEnabled && (
                      <div className="mt-2">
                        <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">
                          {t('radius', { defaultValue: 'Search Radius' })}
                        </label>
                        <Select
                          value={localFilters.radius?.toString() || '50'}
                          onChange={(e) =>
                            handleChange(
                              'radius',
                              e.target.value ? parseInt(e.target.value) : undefined
                            )
                          }
                          options={radiusOptions}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Business Type Section - Collapsible with Checkboxes */}
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
          <button
            onClick={() => toggleSection('businessType')}
            className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              <SlidersHorizontal className="h-4 w-4 text-primary-600" />
              {t('businessType', { defaultValue: 'Business Type' })}
              {selectedBusinessTypes.length > 0 && (
                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                  {selectedBusinessTypes.length}
                </span>
              )}
            </span>
            {expandedSections.businessType ? (
              <ChevronUp className="h-4 w-4 text-neutral-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-neutral-500" />
            )}
          </button>
          <AnimatePresence>
            {expandedSections.businessType && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-1 border-t border-neutral-200 p-3 dark:border-neutral-700">
                  {BUSINESS_TYPES.map((type) => {
                    const isSelected = selectedBusinessTypes.includes(type.value);
                    return (
                      <label
                        key={type.value}
                        className="flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700/30"
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleBusinessTypeToggle(type.value)}
                            className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0"
                          />
                          {isSelected && <Check className="absolute left-0.5 h-3 w-3 text-white" />}
                        </div>
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                          {t(type.labelKey, { defaultValue: type.defaultLabel })}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Service Type Section - Collapsible with Checkboxes */}
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
          <button
            onClick={() => toggleSection('serviceType')}
            className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
            disabled={serviceTypesLoading}
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              <SlidersHorizontal className="h-4 w-4 text-primary-600" />
              {t('serviceType', { defaultValue: 'Service Type' })}
              {selectedServiceTypes.length > 0 && (
                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                  {selectedServiceTypes.length}
                </span>
              )}
            </span>
            {expandedSections.serviceType ? (
              <ChevronUp className="h-4 w-4 text-neutral-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-neutral-500" />
            )}
          </button>
          <AnimatePresence>
            {expandedSections.serviceType && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="max-h-64 space-y-1 overflow-y-auto border-t border-neutral-200 p-3 dark:border-neutral-700">
                  {serviceTypesLoading ? (
                    <div className="flex items-center justify-center gap-2 py-4 text-sm text-neutral-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t('loading', { defaultValue: 'Loading...' })}</span>
                    </div>
                  ) : serviceTypes && serviceTypes.length > 0 ? (
                    serviceTypes.map((type) => {
                      const isSelected = selectedServiceTypes.includes(type.id);
                      return (
                        <label
                          key={type.id}
                          className="flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700/30"
                        >
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleServiceTypeToggle(type.id)}
                              className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0"
                            />
                            {isSelected && (
                              <Check className="absolute left-0.5 h-3 w-3 text-white" />
                            )}
                          </div>
                          <span className="text-sm text-neutral-700 dark:text-neutral-300">
                            {type.displayName || type.name}
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <div className="py-4 text-center text-sm text-neutral-500">
                      {t('noServiceTypes', { defaultValue: 'No service types available' })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rating Section - Collapsible */}
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
          <button
            onClick={() => toggleSection('rating')}
            className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              <span className="text-lg">⭐</span>
              {t('minRating', { defaultValue: 'Minimum Rating' })}
              {localFilters.minRating && localFilters.minRating > 0 && (
                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                  {localFilters.minRating}
                </span>
              )}
            </span>
            {expandedSections.rating ? (
              <ChevronUp className="h-4 w-4 text-neutral-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-neutral-500" />
            )}
          </button>
          <AnimatePresence>
            {expandedSections.rating && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t border-neutral-200 p-3 dark:border-neutral-700">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {localFilters.minRating || 0} {t('stars', { defaultValue: 'stars' })}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {localFilters.minRating === 5
                          ? t('excellent', { defaultValue: 'Excellent' })
                          : localFilters.minRating && localFilters.minRating >= 4
                            ? t('veryGood', { defaultValue: 'Very Good' })
                            : localFilters.minRating && localFilters.minRating >= 3
                              ? t('good', { defaultValue: 'Good' })
                              : t('any', { defaultValue: 'Any' })}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={localFilters.minRating || 0}
                      onChange={(e) =>
                        handleChange(
                          'minRating',
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 dark:bg-neutral-700"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                          ((localFilters.minRating || 0) / 5) * 100
                        }%, #e5e7eb ${((localFilters.minRating || 0) / 5) * 100}%, #e5e7eb 100%)`,
                      }}
                    />
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>0</span>
                      <span>5</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sort By Section - Collapsible */}
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
          <button
            onClick={() => toggleSection('sort')}
            className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              <span className="text-lg">🔀</span>
              {t('sortBy.label', { defaultValue: 'Sort By' })}
            </span>
            {expandedSections.sort ? (
              <ChevronUp className="h-4 w-4 text-neutral-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-neutral-500" />
            )}
          </button>
          <AnimatePresence>
            {expandedSections.sort && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t border-neutral-200 p-3 dark:border-neutral-700">
                  <Select
                    value={localFilters.sortBy || 'rating'}
                    onChange={(e) =>
                      handleChange('sortBy', e.target.value as ServiceSearchParams['sortBy'])
                    }
                    options={sortOptions}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
