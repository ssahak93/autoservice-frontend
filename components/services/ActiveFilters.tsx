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

  if (filters.businessType) {
    activeFilters.push({
      key: 'businessType',
      label: t('businessType', { defaultValue: 'Business Type' }),
      value: t(`businessTypes.${filters.businessType}`, { defaultValue: filters.businessType }),
    });
  }

  if (filters.city) {
    activeFilters.push({
      key: 'city',
      label: t('city'),
      value: filters.city,
    });
  }

  if (filters.region) {
    activeFilters.push({
      key: 'region',
      label: t('region'),
      value: filters.region,
    });
  }

  if (filters.district) {
    activeFilters.push({
      key: 'district',
      label: t('district', { defaultValue: 'District' }),
      value: filters.district,
    });
  }

  if (filters.serviceType && serviceTypeNames) {
    const serviceName = serviceTypeNames.get(filters.serviceType) || filters.serviceType;
    activeFilters.push({
      key: 'serviceType',
      label: t('serviceType'),
      value: serviceName,
    });
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
