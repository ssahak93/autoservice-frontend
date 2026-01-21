'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useMemo, useCallback } from 'react';

import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { ActiveFilters } from '@/components/services/ActiveFilters';
import { FiltersModal } from '@/components/services/FiltersModal';
import { QuickFilters } from '@/components/services/QuickFilters';
import { SearchBarEnhanced } from '@/components/services/SearchBarEnhanced';
import { SearchResultsSkeleton } from '@/components/services/SearchResultsSkeleton';
import { ServiceCard } from '@/components/services/ServiceCard';
import { ServiceFilters } from '@/components/services/ServiceFilters';
import { Button } from '@/components/ui/Button';
import { useSearch } from '@/hooks/useSearch';
import { useServices } from '@/hooks/useServices';
import { useServiceTypes } from '@/hooks/useServiceTypes';
import type { ServiceSearchParams } from '@/lib/services/services.service';
import type { AutoService, PaginatedResponse } from '@/types';

// Lazy load DistrictMap to reduce initial bundle size
const DistrictMap = dynamic(
  () => import('@/components/services/DistrictMap').then((mod) => ({ default: mod.DistrictMap })),
  {
    loading: () => <div className="h-96 w-full animate-pulse rounded-lg bg-neutral-200" />,
    ssr: false,
  }
);

interface ServicesClientProps {
  initialData?: PaginatedResponse<AutoService>;
  initialError?: { message: string; code?: string } | null;
  locale?: string;
}

/**
 * ServicesClient Component
 *
 * Single Responsibility: Orchestrates search UI and data fetching
 * Dependency Inversion: Uses hooks for state management and data fetching
 */
export function ServicesClient({ initialData, initialError }: ServicesClientProps) {
  const t = useTranslations('services');
  const { searchParams, updateSearch, resetSearch, setFilter } = useSearch();
  const { data: serviceTypes } = useServiceTypes();

  // Use React Query for client-side updates, with initial server data
  const { data, isLoading, error, isFetching } = useServices(searchParams, {
    initialData,
  });

  // Use server data if available and no client updates yet
  const displayData = data || initialData;
  const displayError = error || initialError;
  const displayLoading = isLoading && !initialData;

  // Create service type name map for ActiveFilters
  const serviceTypeNames = useMemo(() => {
    if (!serviceTypes) return new Map<string, string>();
    return new Map(serviceTypes.map((type) => [type.id, type.displayName || type.name]));
  }, [serviceTypes]);

  // Count active filters for mobile button badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchParams.businessType) count++;
    if (searchParams.city) count++;
    if (searchParams.region) count++;
    if (searchParams.serviceType) count++;
    if (searchParams.minRating && searchParams.minRating > 0) count++;
    if (searchParams.query) count++;
    if (searchParams.latitude && searchParams.longitude) count++;
    if (searchParams.sortBy && searchParams.sortBy !== 'rating') count++;
    return count;
  }, [searchParams]);

  const hasActiveFilters = activeFiltersCount > 0;

  const handleSearch = useCallback(
    (query: string) => {
      updateSearch({ query }, { resetPage: true });
    },
    [updateSearch]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      // Update query immediately for UI responsiveness
      // Don't reset page here, let debounced search handle it
      // Only update if value actually changed to avoid unnecessary updates
      if (value !== (searchParams.query || '')) {
        updateSearch({ query: value || undefined }, { resetPage: false });
      }
    },
    [updateSearch, searchParams.query]
  );

  const handleRemoveFilter = useCallback(
    (key: keyof typeof searchParams) => {
      setFilter(key, undefined);
    },
    [setFilter]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      updateSearch({ page: newPage });
    },
    [updateSearch]
  );

  const handleFiltersChange = useCallback(
    (newFilters: ServiceSearchParams) => {
      updateSearch(newFilters, { resetPage: true });
    },
    [updateSearch]
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search Bar */}
      <div className="glass-light rounded-xl p-4 sm:p-6">
        <SearchBarEnhanced
          value={searchParams.query || ''}
          onChange={handleSearchChange}
          onSearch={handleSearch}
          isLoading={isFetching}
          showSuggestions={true}
        />
      </div>

      {/* District Map - Show if Yerevan is selected */}
      {searchParams.city?.toLowerCase() === 'yerevan' && (
        <div className="glass-light rounded-xl p-4 sm:p-6">
          <DistrictMap
            cityCode="yerevan"
            selectedDistrictCode={searchParams.district}
            onDistrictSelect={(districtCode) => {
              updateSearch({ district: districtCode }, { resetPage: true });
            }}
            services={
              displayData?.data
                ?.filter((service: AutoService) => !service.isBlocked)
                .map((service: AutoService) => ({
                  id: service.id,
                  name: service.companyName || service.firstName || 'Service',
                  latitude: service.latitude ? Number(service.latitude) : 0,
                  longitude: service.longitude ? Number(service.longitude) : 0,
                  districtCode: service.district || undefined,
                }))
                .filter((s) => s.latitude !== 0 && s.longitude !== 0) || []
            }
            height="500px"
          />
        </div>
      )}

      {/* Mobile Filters Button */}
      <div className="lg:hidden">
        <FiltersModal
          trigger={
            <Button variant="outline" className="w-full" aria-label={t('filters')}>
              <SlidersHorizontal className="mr-2 h-5 w-5" />
              {t('filters')}
              {hasActiveFilters && (
                <span className="ml-2 rounded-full bg-primary-600 px-2 py-0.5 text-xs font-medium text-white">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          }
        >
          <ServiceFilters filters={searchParams} onFiltersChange={handleFiltersChange} />
        </FiltersModal>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8">
        {/* Filters Sidebar - Desktop */}
        <div className="hidden space-y-6 lg:col-span-1 lg:block">
          <QuickFilters filters={searchParams} onFiltersChange={handleFiltersChange} />
          <ServiceFilters filters={searchParams} onFiltersChange={handleFiltersChange} />
        </div>

        {/* Services Grid */}
        <div className="space-y-4 lg:col-span-3">
          {/* Active Filters */}
          <ActiveFilters
            filters={searchParams}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={resetSearch}
            serviceTypeNames={serviceTypeNames}
          />

          {/* Loading State */}
          {displayLoading && <SearchResultsSkeleton count={6} layout="grid" />}

          {/* Error State */}
          {displayError && (
            <div className="rounded-lg bg-error-50 p-6 text-center">
              <p className="mb-4 text-lg font-medium text-error-700">
                {typeof displayError === 'object' &&
                displayError !== null &&
                'message' in displayError
                  ? displayError.message
                  : t('failedToLoadServices')}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  window.location.reload();
                }}
                aria-label={t('retry')}
              >
                {t('retry')}
              </Button>
            </div>
          )}

          {/* Empty State */}
          {displayData && displayData.data.length === 0 && !displayLoading && (
            <EmptyState
              icon={Search}
              title={t('noServices')}
              description={
                hasActiveFilters
                  ? t('tryAdjustingFilters', {
                      defaultValue:
                        'Try adjusting your filters or search terms to find more services.',
                    })
                  : t('noServicesDescription', {
                      defaultValue:
                        'No services found. Check back later or try a different search.',
                    })
              }
              action={
                hasActiveFilters
                  ? {
                      label: t('clearAllFilters', { defaultValue: 'Clear All Filters' }),
                      onClick: resetSearch,
                      variant: 'primary' as const,
                    }
                  : undefined
              }
              secondaryAction={
                hasActiveFilters
                  ? {
                      label: t('browseAll', { defaultValue: 'Browse All Services' }),
                      onClick: resetSearch,
                    }
                  : undefined
              }
            />
          )}

          {/* Results */}
          {displayData && displayData.data.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <div className="text-sm text-neutral-600">
                  {t('foundServices', { count: displayData.pagination.total })}
                </div>
                {isFetching && (
                  <div className="text-xs text-neutral-500">
                    {t('updating', { defaultValue: 'Updating...' })}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                {displayData.data
                  .filter((service: AutoService) => !service.isBlocked) // Filter out blocked services
                  .map((service: AutoService, index: number) => {
                    // Extract distance from search results if available
                    const distance =
                      'distance' in service &&
                      typeof (service as AutoService & { distance?: number }).distance === 'number'
                        ? (service as AutoService & { distance: number }).distance
                        : undefined;
                    return (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        index={index}
                        distance={distance}
                      />
                    );
                  })}
              </div>

              {/* Pagination */}
              {displayData.pagination.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={displayData.pagination.page}
                    totalPages={displayData.pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
