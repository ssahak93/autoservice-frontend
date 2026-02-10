'use client';

import { useMutation } from '@tanstack/react-query';

import { autoServiceProfileService } from '@/lib/services/auto-service-profile.service';
import { useMutationWithInvalidation } from '@/lib/utils/mutation-helpers';

/**
 * Hook for service info mutations
 * Follows Single Responsibility Principle - handles only service info mutation logic
 */
export function useUpdateServiceInfo() {
  const callbacks = useMutationWithInvalidation(
    [['autoServiceProfile'], ['availableAutoServices'], ['auth', 'me']],
    'updateSuccess',
    'updateError',
    'myService.info'
  );

  return useMutation({
    mutationFn: ({
      autoServiceId,
      data,
    }: {
      autoServiceId: string;
      data: {
        companyName?: string;
        firstName?: string;
        lastName?: string;
        avatarFileId?: string;
      };
    }) => autoServiceProfileService.updateServiceInfo(autoServiceId, data),
    ...callbacks,
  });
}
