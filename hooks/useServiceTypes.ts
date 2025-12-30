'use client';

import { useQuery } from '@tanstack/react-query';

import { serviceTypesService, type ServiceType } from '@/lib/services/service-types.service';
import { getCurrentLocale } from '@/lib/utils/i18n';

/**
 * Hook to get all service types
 */
export function useServiceTypes() {
  const locale = getCurrentLocale();

  return useQuery({
    queryKey: ['service-types', 'all'],
    queryFn: () => serviceTypesService.getAll(),
    staleTime: 30 * 60 * 1000, // 30 minutes - service types don't change often
    select: (data) => {
      // Localize service type names based on current locale
      return data.map((type) => ({
        ...type,
        displayName:
          locale === 'hy' && type.nameHy
            ? type.nameHy
            : locale === 'ru' && type.nameRu
              ? type.nameRu
              : type.name,
      }));
    },
  });
}

/**
 * Hook to get service types by category
 */
export function useServiceTypesByCategory(category: string) {
  const locale = getCurrentLocale();

  return useQuery({
    queryKey: ['service-types', 'category', category],
    queryFn: () => serviceTypesService.getByCategory(category),
    enabled: !!category,
    staleTime: 30 * 60 * 1000,
    select: (data) => {
      return data.map((type) => ({
        ...type,
        displayName:
          locale === 'hy' && type.nameHy
            ? type.nameHy
            : locale === 'ru' && type.nameRu
              ? type.nameRu
              : type.name,
      }));
    },
  });
}

