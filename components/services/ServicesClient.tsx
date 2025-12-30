'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { SkeletonCard } from '@/components/common/Skeleton';
import { ServiceCard } from '@/components/services/ServiceCard';
import { ServiceFilters } from '@/components/services/ServiceFilters';
import { Button } from '@/components/ui/Button';
import { useServices } from '@/hooks/useServices';
import type { ServiceSearchParams } from '@/lib/services/services.service';
import type { AutoService, PaginatedResponse } from '@/types';

interface ServicesClientProps {
  initialData?: PaginatedResponse<AutoService>;
  initialError?: Error | null;
  locale?: string;
}

export function ServicesClient({ initialData, initialError }: ServicesClientProps) {
  const t = useTranslations('services');
  const [filters, setFilters] = useState<ServiceSearchParams>({
    page: initialData?.pagination.page || 1,
    limit: initialData?.pagination.limit || 20,
  });

  // Use React Query for client-side updates, with initial server data
  const { data, isLoading, error } = useServices(filters, {
    initialData,
  });

  // Use server data if available and no client updates yet
  const displayData = data || initialData;
  const displayError = error || initialError;
  const displayLoading = isLoading && !initialData;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
      {/* Filters Sidebar */}
      <div className="lg:col-span-1">
        <ServiceFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Services Grid */}
      <div className="lg:col-span-3">
        {displayLoading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {displayError && (
          <div className="rounded-lg bg-error-50 p-6 text-center">
            <p className="mb-4 text-lg font-medium text-error-700">{t('failedToLoadServices')}</p>
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

        {displayData && displayData.data.length === 0 && (
          <div className="rounded-lg bg-neutral-100 p-8 text-center">
            <p className="text-lg font-medium text-neutral-600">{t('noServices')}</p>
          </div>
        )}

        {displayData && displayData.data.length > 0 && (
          <>
            <div className="mb-4 text-sm text-neutral-600">
              {t('foundServices', { count: displayData.pagination.total })}
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {displayData.data.map((service: AutoService, index: number) => (
                <ServiceCard key={service.id} service={service} index={index} />
              ))}
            </div>

            {/* Pagination */}
            {displayData.pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                  disabled={filters.page === 1}
                >
                  {t('previous')}
                </Button>
                <span className="px-4 py-2 text-sm text-neutral-600">
                  {t('page')} {displayData.pagination.page} {t('of')} {displayData.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                  disabled={filters.page === displayData.pagination.totalPages}
                >
                  {t('next')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

