'use client';

import { Car, Droplets, ShoppingBag, Sparkles, Wrench } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';

import { Button } from '@/components/ui/Button';
import type { ServiceSearchParams } from '@/lib/services/services.service';

interface QuickFiltersProps {
  filters: ServiceSearchParams;
  onFiltersChange: (filters: Partial<ServiceSearchParams>) => void;
}

const QUICK_FILTERS = [
  {
    key: 'auto_service',
    icon: Wrench,
    labelKey: 'businessTypes.auto_service',
  },
  {
    key: 'car_wash',
    icon: Droplets,
    labelKey: 'businessTypes.car_wash',
  },
  {
    key: 'auto_shop',
    icon: ShoppingBag,
    labelKey: 'businessTypes.auto_shop',
  },
  {
    key: 'cleaning',
    icon: Sparkles,
    labelKey: 'businessTypes.cleaning',
  },
  {
    key: 'tire_service',
    icon: Car,
    labelKey: 'businessTypes.tire_service',
  },
] as const;

/**
 * QuickFilters Component
 *
 * Provides quick access to common business type filters
 */
export function QuickFilters({ filters, onFiltersChange }: QuickFiltersProps) {
  const t = useTranslations('services');

  const handleQuickFilterClick = useCallback(
    (businessType: string) => {
      if (filters.businessType === businessType) {
        // If already selected, clear it
        onFiltersChange({ businessType: undefined });
      } else {
        // Select the filter
        onFiltersChange({ businessType: businessType as ServiceSearchParams['businessType'] });
      }
    },
    [filters.businessType, onFiltersChange]
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-neutral-700">
        {t('quickFilters', { defaultValue: 'Quick Filters' })}
      </h3>
      <div className="flex flex-wrap gap-2">
        {QUICK_FILTERS.map((filter) => {
          const Icon = filter.icon;
          const isActive = filters.businessType === filter.key;

          return (
            <Button
              key={filter.key}
              variant={isActive ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleQuickFilterClick(filter.key)}
              className="flex items-center gap-2"
              aria-label={t(filter.labelKey, { defaultValue: filter.key })}
              aria-pressed={isActive}
            >
              <Icon className="h-4 w-4" />
              <span>{t(filter.labelKey, { defaultValue: filter.key })}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
