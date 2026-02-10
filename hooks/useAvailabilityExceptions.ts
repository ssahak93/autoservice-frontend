'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import { availabilityService } from '@/lib/services/availability.service';
import { useMutationWithInvalidation } from '@/lib/utils/mutation-helpers';
import { useAutoServiceStore } from '@/stores/autoServiceStore';

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
  const { selectedAutoServiceId: storeSelectedId } = useAutoServiceStore();

  // Get selected auto service ID (use provided ID or from store)
  const selectedAutoServiceId = autoServiceId || storeSelectedId;

  // Fetch exceptions
  const { data: exceptions = [], isLoading } = useQuery({
    queryKey: ['availability-exceptions', selectedAutoServiceId],
    queryFn: () => availabilityService.getExceptions(selectedAutoServiceId || undefined),
    enabled: !!selectedAutoServiceId,
  });

  // Common callbacks for all mutations
  const commonCallbacks = useMutationWithInvalidation(
    [['availability-exceptions'], ['availability']],
    'exceptionCreated',
    undefined,
    'myService.availability'
  );

  // Create exception mutation
  const createMutation = useMutation({
    mutationFn: (data: {
      date: string;
      isAvailable: boolean;
      startTime?: string;
      endTime?: string;
      reason?: string;
    }) => availabilityService.createException(data, selectedAutoServiceId || undefined),
    ...commonCallbacks,
  });

  // Update exception mutation
  const updateCallbacks = useMutationWithInvalidation(
    [['availability-exceptions'], ['availability']],
    'exceptionUpdated',
    undefined,
    'myService.availability'
  );
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AvailabilityException> }) => {
      const cleanData = {
        ...data,
        startTime: data.startTime ?? undefined,
        endTime: data.endTime ?? undefined,
        reason: data.reason ?? undefined,
      };
      return availabilityService.updateException(id, cleanData, selectedAutoServiceId || undefined);
    },
    ...updateCallbacks,
  });

  // Delete exception mutation
  const deleteCallbacks = useMutationWithInvalidation(
    [['availability-exceptions'], ['availability']],
    'exceptionDeleted',
    undefined,
    'myService.availability'
  );
  const deleteMutation = useMutation({
    mutationFn: (id: string) => availabilityService.deleteException(id),
    ...deleteCallbacks,
  });

  return {
    exceptions,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
