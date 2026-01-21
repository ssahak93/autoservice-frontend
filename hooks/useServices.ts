'use client';

import { useQuery } from '@tanstack/react-query';

import { queryConfig, queryKeys } from '@/lib/api/query-config';
import { servicesService, type ServiceSearchParams } from '@/lib/services/services.service';
import type { AutoService, PaginatedResponse } from '@/types';

export const useServices = (
  params: ServiceSearchParams,
  options?: { initialData?: PaginatedResponse<AutoService> }
) => {
  return useQuery({
    queryKey: queryKeys.services(params),
    queryFn: () => servicesService.search(params),
    staleTime: queryConfig.staleTime,
    gcTime: queryConfig.gcTime,
    initialData: options?.initialData,
    // Keep previous data while fetching new data (better UX)
    placeholderData: (previousData) => previousData,
  });
};

export const useService = (id: string | null) => {
  return useQuery<AutoService | null>({
    queryKey: queryKeys.service(id || ''),
    queryFn: () => (id ? servicesService.getById(id) : null),
    enabled: !!id,
    staleTime: queryConfig.staleTime,
    gcTime: queryConfig.gcTime,
    placeholderData: (previousData) => previousData,
  });
};

export const useServiceReviews = (
  serviceId: string | null,
  params?: { page?: number; limit?: number }
) => {
  return useQuery({
    queryKey: queryKeys.serviceReviews(serviceId || '', params),
    queryFn: () => (serviceId ? servicesService.getReviews(serviceId, params) : null),
    enabled: !!serviceId,
    staleTime: queryConfig.staleTime,
    gcTime: queryConfig.gcTime,
  });
};
