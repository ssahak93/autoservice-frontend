'use client';

import { visitsService } from '@/lib/services/visits.service';
import { useUIStore } from '@/stores/uiStore';
import type { CreateVisitRequest } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useVisits = (params?: { status?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['visits', params],
    queryFn: () => visitsService.getList(params),
  });
};

export const useVisit = (id: string | null) => {
  return useQuery({
    queryKey: ['visit', id],
    queryFn: () => (id ? visitsService.getById(id) : null),
    enabled: !!id,
  });
};

export const useCreateVisit = () => {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: (data: CreateVisitRequest) => visitsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      showToast('Visit booked successfully', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to book visit', 'error');
    },
  });
};

export const useUpdateVisitStatus = () => {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    }) => visitsService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      showToast('Visit status updated', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to update visit status', 'error');
    },
  });
};
