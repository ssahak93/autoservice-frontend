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
  });
};
