'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { visitsService } from '@/lib/services/visits.service';
import { useUIStore } from '@/stores/uiStore';
import type { CreateVisitRequest } from '@/types';

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
  const t = useTranslations('visits');

  return useMutation({
    mutationFn: (data: CreateVisitRequest) => visitsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      showToast(t('bookedSuccessfully', { defaultValue: 'Visit booked successfully' }), 'success');
    },
    onError: (error: Error) => {
      showToast(
        error.message || t('failedToBook', { defaultValue: 'Failed to book visit' }),
        'error'
      );
    },
  });
};

export const useUpdateVisitStatus = () => {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();
  const t = useTranslations('visits');

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
      showToast(t('statusUpdated', { defaultValue: 'Visit status updated' }), 'success');
    },
    onError: (error: Error) => {
      showToast(
        error.message ||
          t('failedToUpdateStatus', { defaultValue: 'Failed to update visit status' }),
        'error'
      );
    },
  });
};
