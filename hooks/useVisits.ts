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
    queryFn: async () => {
      if (!id) return null;
      const result = await visitsService.getById(id);
      return result || null;
    },
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
      // Backend returns translated error message, use it directly
      const errorMessage =
        error.message || t('failedToBook', { defaultValue: 'Failed to book visit' });
      showToast(errorMessage, 'error');
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

export const useUpdateVisit = () => {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();
  const t = useTranslations('visits');

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateVisitRequest> }) =>
      visitsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      queryClient.invalidateQueries({ queryKey: ['visit'] });
      showToast(
        t('updatedSuccessfully', { defaultValue: 'Visit updated successfully' }),
        'success'
      );
    },
    onError: (error: Error) => {
      showToast(
        error.message || t('failedToUpdate', { defaultValue: 'Failed to update visit' }),
        'error'
      );
    },
  });
};

export const useCancelVisit = () => {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();
  const t = useTranslations('visits');

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      visitsService.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      queryClient.invalidateQueries({ queryKey: ['visit'] });
      showToast(
        t('cancelledSuccessfully', { defaultValue: 'Visit cancelled successfully' }),
        'success'
      );
    },
    onError: (error: Error) => {
      showToast(
        error.message || t('failedToCancel', { defaultValue: 'Failed to cancel visit' }),
        'error'
      );
    },
  });
};

export const useVisitHistory = (visitId: string | null) => {
  return useQuery({
    queryKey: ['visit-history', visitId],
    queryFn: async () => {
      if (!visitId) return [];
      return visitsService.getHistory(visitId);
    },
    enabled: !!visitId,
  });
};
