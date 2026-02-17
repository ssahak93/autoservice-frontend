'use client';

import { useMutation } from '@tanstack/react-query';

import { queryKeys } from '@/lib/api/query-config';
import { providerBranchService } from '@/lib/services/provider-branch.service';
import type {
  CreateBranchRequest,
  UpdateBranchRequest,
} from '@/lib/services/provider-branch.service';
import { useMutationWithInvalidation } from '@/lib/utils/mutation-helpers';
import { useProviderStore } from '@/stores/providerStore';

/**
 * Hook for profile mutations
 * Follows Single Responsibility Principle - handles only profile mutation logic
 */
export function useCreateProfile() {
  const { selectedProviderId } = useProviderStore();
  const callbacks = useMutationWithInvalidation(
    [...queryKeys.providerBranch()] as string[],
    'createSuccess',
    'createError',
    'myService.profile'
  );

  return useMutation({
    mutationFn: (data: CreateBranchRequest) =>
      providerBranchService.createBranch(data, selectedProviderId || undefined),
    ...callbacks,
  });
}

/**
 * Hook for updating profile
 */
export function useUpdateProfile() {
  const { selectedProviderId } = useProviderStore();
  const callbacks = useMutationWithInvalidation(
    [...queryKeys.providerBranch()] as string[],
    'updateSuccess',
    'updateError',
    'myService.profile'
  );

  return useMutation({
    mutationFn: (data: UpdateBranchRequest) =>
      providerBranchService.updateBranch(data, selectedProviderId || undefined),
    ...callbacks,
  });
}
