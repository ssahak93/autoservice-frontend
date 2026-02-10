'use client';

import { useQuery } from '@tanstack/react-query';

import { queryKeys, queryConfig } from '@/lib/api/query-config';
import { serviceTypesService } from '@/lib/services/service-types.service';
import { localizeServiceTypes } from '@/lib/utils/service-type-localization';

/**
 * Hook to get all service types
 */
export function useServiceTypes() {
  return useQuery({
    queryKey: queryKeys.serviceTypes(),
    queryFn: () => serviceTypesService.getAll(),
    staleTime: queryConfig.staleTimes.long, // 30 minutes - service types don't change often
    gcTime: queryConfig.gcTime,
    select: (data) => localizeServiceTypes(data),
  });
}

/**
 * Hook to get service types by category
 */
export function useServiceTypesByCategory(category: string) {
  return useQuery({
    queryKey: queryKeys.serviceTypesByCategory(category),
    queryFn: () => serviceTypesService.getByCategory(category),
    enabled: !!category,
    staleTime: queryConfig.staleTimes.long, // 30 minutes
    gcTime: queryConfig.gcTime,
    select: (data) => localizeServiceTypes(data),
  });
}
