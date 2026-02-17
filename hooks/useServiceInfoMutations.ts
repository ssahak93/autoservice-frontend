'use client';

import { useMutation } from '@tanstack/react-query';

import { providerBranchService } from '@/lib/services/provider-branch.service';
import { useMutationWithInvalidation } from '@/lib/utils/mutation-helpers';

/**
 * Hook for service info mutations
 * Follows Single Responsibility Principle - handles only service info mutation logic
 */
export function useUpdateServiceInfo() {
  const callbacks = useMutationWithInvalidation(
    [['providerBranch'], ['availableProviders'], ['auth', 'me']],
    'updateSuccess',
    'updateError',
    'myService.info'
  );

  return useMutation({
    mutationFn: ({
      providerId,
      data,
    }: {
      providerId: string;
      data: {
        companyName?: string;
        firstName?: string;
        lastName?: string;
        avatarFileId?: string;
      };
    }) => providerBranchService.updateServiceInfo(providerId, data),
    ...callbacks,
  });
}
