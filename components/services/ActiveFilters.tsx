'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { ServiceSearchParams } from '@/lib/services/services.service';

interface ActiveFiltersProps {
  filters: ServiceSearchParams;
  onRemoveFilter: (key: keyof ServiceSearchParams) => void;
  onClearAll: () => void;
  serviceTypeNames?: Map<string, string>;
}

/**
 * ActiveFilters Component
 *
 * Single Responsibility: Only displays active filters as removable chips
 * Open/Closed: Can be extended with new filter types without modifying core logic
 */
export function ActiveFilters({
  filters,
  onRemoveFilter,
  onClearAll,
  serviceTypeNames,
}: ActiveFiltersProps) {
  const t = useTranslations('services');

  const activeFilters: Array<{ key: keyof ServiceSearchParams; label: string; value: string }> = [];

  // Handle multiple business types
  const businessTypes = filters.businessTypes || [];
  if (businessTypes.length > 0) {
    if (businessTypes.length === 1) {
      activeFilters.push({
        key: 'businessTypes',
        label: t('businessType', { defaultValue: 'Business Type' }),
        value: t(`businessTypes.${businessTypes[0]}`, { defaultValue: businessTypes[0] }),
      });
    } else {
      activeFilters.push({
        key: 'businessTypes',
        label: t('businessType', { defaultValue: 'Business Type' }),
        value: `${businessTypes.length} ${t('selected', { defaultValue: 'selected' })}`,
      });
    }
  }

  // Note: city, region, and district filters removed - use communityId and regionId instead

  // Handle multiple service types
  const serviceTypes = filters.serviceTypes || [];
  if (serviceTypes.length > 0 && serviceTypeNames) {
    if (serviceTypes.length === 1) {
      const serviceName = serviceTypeNames.get(serviceTypes[0]) || serviceTypes[0];
      activeFilters.push({
        key: 'serviceTypes',
        label: t('serviceType'),
        value: serviceName,
      });
    } else {
      activeFilters.push({
        key: 'serviceTypes',
        label: t('serviceType'),
        value: `${serviceTypes.length} ${t('selected', { defaultValue: 'selected' })}`,
      });
    }
  }

  if (filters.minRating && filters.minRating > 0) {
    activeFilters.push({
      key: 'minRating',
      label: t('minRating'),
      value: `≥ ${filters.minRating.toFixed(1)} ⭐`,
    });
  }

  if (filters.query) {
    activeFilters.push({
      key: 'query',
      label: t('search'),
      value: filters.query,
    });
  }

  if (filters.latitude && filters.longitude) {
    activeFilters.push({
      key: 'latitude',
      label: t('location'),
      value: t('locationEnabled'),
    });
  }

  if (filters.sortBy && filters.sortBy !== 'rating') {
    activeFilters.push({
      key: 'sortBy',
      label: t('sortBy.label'),
      value: t(`sortBy.${filters.sortBy}`),
    });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-neutral-600">
        {t('activeFilters', { defaultValue: 'Active filters' })}:
      </span>
      {activeFilters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => {
            if (filter.key === 'latitude') {
              // Remove both latitude and longitude
              onRemoveFilter('latitude');
              onRemoveFilter('longitude');
              onRemoveFilter('radius');
            } else if (filter.key === 'businessTypes') {
              // Remove business types array
              onRemoveFilter('businessTypes');
            } else if (filter.key === 'serviceTypes') {
              // Remove service types array
              onRemoveFilter('serviceTypes');
            } else {
              onRemoveFilter(filter.key);
            }
          }}
          className="group flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100"
          aria-label={`${t('removeFilter', { defaultValue: 'Remove' })} ${filter.label}: ${filter.value}`}
        >
          <span className="text-xs text-primary-600">{filter.label}:</span>
          <span>{filter.value}</span>
          <X className="h-3.5 w-3.5 text-primary-600 transition-colors group-hover:text-primary-800" />
        </button>
      ))}
      {activeFilters.length > 1 && (
        <button
          onClick={onClearAll}
          className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200"
          aria-label={t('clearAllFilters', { defaultValue: 'Clear all filters' })}
        >
          {t('clearAll', { defaultValue: 'Clear all' })}
        </button>
      )}
    </div>
  );
}
