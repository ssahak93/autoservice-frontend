'use client';

import { useTranslations } from 'next-intl';

import type { ServiceSearchParams } from '@/lib/services/services.service';

interface QuickFiltersProps {
  filters: ServiceSearchParams;
  onFiltersChange: (filters: ServiceSearchParams) => void;
}

/**
 * QuickFilters Component
 *
 * Provides quick access to common business type filters
 */
export function QuickFilters(_props: QuickFiltersProps) {
  const t = useTranslations('services');

  // handleQuickFilterClick removed - ProviderType model has been removed

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-neutral-700">
        {t('quickFilters', { defaultValue: 'Quick Filters' })}
      </h3>
      {/* Quick filters removed - ProviderType model has been removed */}
      <div className="flex flex-wrap gap-2">{/* No quick filters available */}</div>
    </div>
  );
}
