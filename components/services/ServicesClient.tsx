'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useCallback, useRef, useEffect } from 'react';

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
import type { Provider, PaginatedResponse } from '@/types';

// DistrictMap removed - districts are now communities, no need for separate map component

interface ServicesClientProps {
  initialData?: PaginatedResponse<Provider>;
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

  // CRITICAL: Store URL page in ref to prevent automatic redirects
  // This ensures URL page is NEVER changed automatically
  const urlPageRef = useRef<number>(searchParams.page || 1);

  // Update ref when URL page changes (user navigation)
  useEffect(() => {
    urlPageRef.current = searchParams.page || 1;
  }, [searchParams.page]);

  // Use React Query for client-side updates, with initial server data
  const { data, isLoading, error, isFetching } = useServices(searchParams, {
    initialData,
  });

  // Simple: use data from query or initial server data
  const displayData = data || initialData;
  const displayError = error || initialError;
  const displayLoading = isLoading && !initialData;

  // Simple: sync page from URL (source of truth)
  // IMPORTANT: Always preserve URL page, even if backend returns different page
  // This prevents automatic redirect to page 1
  // Use ref to ensure we always use the URL page, not backend page
  const syncedDisplayData = displayData
    ? {
        ...displayData,
        pagination: {
          ...displayData.pagination,
          page: urlPageRef.current, // Always use URL page from ref - never change it
        },
      }
    : undefined;

  // Create service type name map for ActiveFilters
  const serviceTypeNames = useMemo(() => {
    if (!serviceTypes) return new Map<string, string>();
    return new Map(serviceTypes.map((type) => [type.id, type.displayName || type.name]));
  }, [serviceTypes]);

  // Count active filters for mobile button badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    // providerTypes removed - ProviderType model has been removed
    if (searchParams.serviceTypes && searchParams.serviceTypes.length > 0)
      count += searchParams.serviceTypes.length;
    if (searchParams.regionId) count++;
    if (searchParams.communityId) count++;
    if (searchParams.minRating && searchParams.minRating > 0) count++;
    if (searchParams.query) count++;
    if (searchParams.latitude && searchParams.longitude) count++;
    if (searchParams.sortBy && searchParams.sortBy !== 'rating') count++;
    return count;
  }, [searchParams]);

  const hasActiveFilters = activeFiltersCount > 0;

  const handleSearch = useCallback(
    (query: string) => {
      // Only update URL when user actually searches (debounced or Enter)
      updateSearch({ query }, { resetPage: true });
    },
    [updateSearch]
  );

  const handleSearchChange = useCallback((_value: string) => {
    // IMPORTANT: Do NOT update URL on every keystroke
    // Only update local state - let debounced search handle URL update
    // This prevents multiple requests for each character typed
    // SearchBarEnhanced will call onSearch with debounced value
  }, []);

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
      // IMPORTANT: Do NOT reset page automatically - preserve URL page
      // Only update filters, keep current page from URL
      const filtersWithoutPage = { ...newFilters };
      // Preserve current page from URL - don't reset to 1
      filtersWithoutPage.page = searchParams.page || 1;
      updateSearch(filtersWithoutPage, { resetPage: false });
    },
    [updateSearch, searchParams.page]
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

      {/* District Map removed - districts are now communities, can be filtered via communityId */}

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
          <AnimatePresence mode="wait">
            {displayLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <SearchResultsSkeleton count={6} layout="grid" />
              </motion.div>
            )}
          </AnimatePresence>

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
          <AnimatePresence>
            {syncedDisplayData && syncedDisplayData.data.length === 0 && !displayLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          {syncedDisplayData && syncedDisplayData.data.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <div className="text-sm text-neutral-600">
                  {t('foundServices', { count: syncedDisplayData.pagination.total })}
                </div>
                {isFetching && (
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
                    <span>{t('updating', { defaultValue: 'Updating...' })}</span>
                  </div>
                )}
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2"
              >
                {syncedDisplayData.data
                  .filter((provider: Provider) => !provider.isBlocked) // Filter out blocked providers
                  .map((provider: Provider, index: number) => {
                    // Extract distance from search results if available
                    const distance =
                      'distance' in provider &&
                      typeof (provider as Provider & { distance?: number }).distance === 'number'
                        ? (provider as Provider & { distance: number }).distance
                        : undefined;
                    return (
                      <ServiceCard
                        key={provider.id}
                        service={provider}
                        index={index}
                        distance={distance}
                      />
                    );
                  })}
              </motion.div>

              {/* Pagination */}
              {syncedDisplayData.pagination.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={syncedDisplayData.pagination.page}
                    totalPages={syncedDisplayData.pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}

          {/* Show pagination if page is out of range - allow navigation */}
          {syncedDisplayData &&
            syncedDisplayData.pagination.totalPages > 0 &&
            (searchParams.page || 1) > syncedDisplayData.pagination.totalPages && (
              <div className="mt-8">
                <Pagination
                  currentPage={searchParams.page || 1}
                  totalPages={syncedDisplayData.pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
