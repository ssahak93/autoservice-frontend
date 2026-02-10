'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { queryKeys, queryConfig } from '@/lib/api/query-config';
import { visitsService } from '@/lib/services/visits.service';
import { isAuthenticated } from '@/lib/utils/auth-check';
import { useMutationWithInvalidation } from '@/lib/utils/mutation-helpers';
import { useUIStore } from '@/stores/uiStore';
import type { CreateVisitRequest, Visit } from '@/types';

export const useVisits = (
  params?: { status?: string; page?: number; limit?: number },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: queryKeys.visits(params),
    queryFn: () => visitsService.getList(params),
    enabled: options?.enabled !== false && isAuthenticated(), // Only fetch if user is authenticated
    staleTime: queryConfig.staleTime,
    gcTime: queryConfig.gcTime,
    placeholderData: (previousData) => previousData,
  });
};

export const useVisit = (id: string | null) => {
  return useQuery({
    queryKey: queryKeys.visit(id || ''),
    queryFn: async () => {
      if (!id) return null;
      const result = await visitsService.getById(id);
      return result || null;
    },
    enabled: !!id,
    staleTime: queryConfig.staleTime,
    gcTime: queryConfig.gcTime,
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateVisit = () => {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();
  const t = useTranslations('visits');

  return useMutation({
    mutationFn: (data: CreateVisitRequest) => visitsService.create(data),
    onMutate: async (newVisit) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['visits'] });

      // Snapshot previous value
      const previousVisits = queryClient.getQueryData<{ data: Visit[] }>(['visits']);

      // Optimistically update cache
      queryClient.setQueryData<{ data: Visit[] }>(['visits'], (old) => {
        if (!old) return old;
        // Create temporary visit object for optimistic update
        const tempVisit: Visit = {
          id: `temp-${Date.now()}`,
          ...newVisit,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Visit;
        return {
          ...old,
          data: [tempVisit, ...old.data],
        };
      });

      return { previousVisits };
    },
    onSuccess: (data) => {
      // Replace temporary visit with real one
      queryClient.setQueryData<{ data: Visit[] }>(['visits'], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((visit) => (visit.id.startsWith('temp-') ? data : visit)),
        };
      });
      // Update individual visit cache to ensure it's available when chat opens
      if (data?.id) {
        queryClient.setQueryData(queryKeys.visit(data.id), data);
      }
      showToast(t('bookedSuccessfully', { defaultValue: 'Visit booked successfully' }), 'success');
    },
    onError: (error: Error, _variables, context) => {
      // Rollback on error
      if (context?.previousVisits) {
        queryClient.setQueryData(['visits'], context.previousVisits);
      }
      const errorMessage =
        error.message || t('failedToBook', { defaultValue: 'Failed to book visit' });
      showToast(errorMessage, 'error');
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['visits'] });
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
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['visits'] });
      await queryClient.cancelQueries({ queryKey: ['visit', id] });

      const previousVisits = queryClient.getQueryData<{ data: Visit[] }>(['visits']);
      const previousVisit = queryClient.getQueryData<Visit>(['visit', id]);

      // Optimistically update
      queryClient.setQueryData<{ data: Visit[] }>(['visits'], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((visit) => (visit.id === id ? { ...visit, status } : visit)),
        };
      });

      queryClient.setQueryData<Visit>(['visit', id], (old) => {
        if (!old) return old;
        return { ...old, status };
      });

      return { previousVisits, previousVisit };
    },
    onSuccess: () => {
      showToast(t('statusUpdated', { defaultValue: 'Visit status updated' }), 'success');
    },
    onError: (error: Error, _variables, context) => {
      // Rollback on error
      if (context?.previousVisits) {
        queryClient.setQueryData(['visits'], context.previousVisits);
      }
      if (context?.previousVisit) {
        queryClient.setQueryData(['visit', _variables.id], context.previousVisit);
      }
      showToast(
        error.message ||
          t('failedToUpdateStatus', { defaultValue: 'Failed to update visit status' }),
        'error'
      );
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      queryClient.invalidateQueries({ queryKey: ['visit', variables.id] });
    },
  });
};

export const useUpdateVisit = () => {
  const callbacks = useMutationWithInvalidation(
    [['visits'], ['visit']],
    'updatedSuccessfully',
    'failedToUpdate',
    'visits'
  );

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateVisitRequest> }) =>
      visitsService.update(id, data),
    ...callbacks,
  });
};

export const useCancelVisit = () => {
  const callbacks = useMutationWithInvalidation(
    [['visits'], ['visit']],
    'cancelledSuccessfully',
    'failedToCancel',
    'visits'
  );

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      visitsService.cancel(id, reason || ''),
    ...callbacks,
  });
};

export const useVisitHistory = (visitId: string | null) => {
  return useQuery({
    queryKey: queryKeys.visitHistory(visitId || ''),
    queryFn: async () => {
      if (!visitId) return [];
      return visitsService.getHistory(visitId);
    },
    enabled: !!visitId,
    staleTime: queryConfig.staleTime,
    gcTime: queryConfig.gcTime,
  });
};
