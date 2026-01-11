'use client';

import { useQuery } from '@tanstack/react-query';

import { visitsService } from '@/lib/services/visits.service';
import { useAutoServiceStore } from '@/stores/autoServiceStore';

export interface DashboardStatistics {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  today: number;
}

export const useDashboardStatistics = (params?: { startDate?: string; endDate?: string }) => {
  const { selectedAutoServiceId } = useAutoServiceStore();
  return useQuery({
    queryKey: ['dashboard', 'statistics', params, selectedAutoServiceId],
    queryFn: () =>
      visitsService.getAutoServiceStatistics({
        ...params,
        autoServiceId: selectedAutoServiceId || undefined,
      }),
    enabled: !!selectedAutoServiceId,
    // Statistics can be cached longer (10 minutes) as they don't change frequently
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useAutoServiceVisits = (params?: {
  status?: string;
  date?: string;
  page?: number;
  limit?: number;
}) => {
  const { selectedAutoServiceId } = useAutoServiceStore();
  return useQuery({
    queryKey: ['dashboard', 'visits', params, selectedAutoServiceId],
    queryFn: () =>
      visitsService.getAutoServiceList({
        ...params,
        autoServiceId: selectedAutoServiceId || undefined,
      }),
    enabled: !!selectedAutoServiceId,
    // Visits list should be fresh (2 minutes) as statuses change frequently
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};
