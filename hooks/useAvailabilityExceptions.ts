'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { availabilityService } from '@/lib/services/availability.service';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

export interface AvailabilityException {
  id: string;
  date: string;
  isAvailable: boolean;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
}

/**
 * Hook for availability exceptions
 * Follows Single Responsibility Principle - handles only availability exception operations
 */
export function useAvailabilityExceptions(autoServiceId: string | null) {
  const t = useTranslations('myService.availability');
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Get selected auto service ID (if user owns multiple)
  const selectedAutoServiceId = autoServiceId || user?.autoServices?.[0]?.id;

  // Fetch exceptions
  const { data: exceptions = [], isLoading } = useQuery({
    queryKey: ['availability-exceptions', selectedAutoServiceId],
    queryFn: () => availabilityService.getExceptions(selectedAutoServiceId),
    enabled: !!selectedAutoServiceId,
  });

  // Create exception mutation
  const createMutation = useMutation({
    mutationFn: (data: {
      date: string;
      isAvailable: boolean;
      startTime?: string;
      endTime?: string;
      reason?: string;
    }) => availabilityService.createException(data, selectedAutoServiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-exceptions'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      showToast(
        t('exceptionCreated', { defaultValue: 'Exception created successfully' }),
        'success'
      );
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create exception';
      showToast(errorMessage, 'error');
    },
  });

  // Update exception mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AvailabilityException> }) =>
      availabilityService.updateException(id, data, selectedAutoServiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-exceptions'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      showToast(
        t('exceptionUpdated', { defaultValue: 'Exception updated successfully' }),
        'success'
      );
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update exception';
      showToast(errorMessage, 'error');
    },
  });

  // Delete exception mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => availabilityService.deleteException(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-exceptions'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      showToast(
        t('exceptionDeleted', { defaultValue: 'Exception deleted successfully' }),
        'success'
      );
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete exception';
      showToast(errorMessage, 'error');
    },
  });

  return {
    exceptions,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
