'use client';

import { useQuery } from '@tanstack/react-query';

import { visitsService } from '@/lib/services/visits.service';
import { useProviderStore } from '@/stores/providerStore';

export interface DashboardStatistics {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  today: number;
}

export const useDashboardStatistics = (params?: { startDate?: string; endDate?: string }) => {
  const { selectedProviderId } = useProviderStore();
  return useQuery({
    queryKey: ['dashboard', 'statistics', params, selectedProviderId],
    queryFn: () =>
      visitsService.getProviderStatistics({
        ...params,
        providerId: selectedProviderId || undefined,
      }),
    enabled: !!selectedProviderId,
    // Statistics can be cached longer (10 minutes) as they don't change frequently
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useProviderVisits = (params?: {
  status?: string;
  date?: string;
  page?: number;
  limit?: number;
}) => {
  const { selectedProviderId } = useProviderStore();
  return useQuery({
    queryKey: ['dashboard', 'visits', params, selectedProviderId],
    queryFn: () =>
      visitsService.getProviderList({
        ...params,
        providerId: selectedProviderId || undefined,
      }),
    enabled: !!selectedProviderId,
    // Visits list should be fresh (2 minutes) as statuses change frequently
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};
