'use client';

import { servicesService, type ServiceSearchParams } from '@/lib/services/services.service';
import type { AutoService, Review } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const useServices = (
  params: ServiceSearchParams,
  options?: { initialData?: any }
) => {
  return useQuery({
    queryKey: ['services', params],
    queryFn: () => servicesService.search(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: options?.initialData,
  });
};

export const useService = (id: string | null) => {
  return useQuery<AutoService | null>({
    queryKey: ['service', id],
    queryFn: () => (id ? servicesService.getById(id) : null),
    enabled: !!id,
  });
};

export const useServiceReviews = (
  serviceId: string | null,
  params?: { page?: number; limit?: number }
) => {
  return useQuery({
    queryKey: ['service-reviews', serviceId, params],
    queryFn: () => (serviceId ? servicesService.getReviews(serviceId, params) : null),
    enabled: !!serviceId,
  });
};
