'use client';

import { useMutation } from '@tanstack/react-query';

import { queryKeys } from '@/lib/api/query-config';
import { autoServiceProfileService } from '@/lib/services/auto-service-profile.service';
import type {
  CreateProfileRequest,
  UpdateProfileRequest,
} from '@/lib/services/auto-service-profile.service';
import { useMutationWithInvalidation } from '@/lib/utils/mutation-helpers';
import { useAutoServiceStore } from '@/stores/autoServiceStore';

/**
 * Hook for profile mutations
 * Follows Single Responsibility Principle - handles only profile mutation logic
 */
export function useCreateProfile() {
  const { selectedAutoServiceId } = useAutoServiceStore();
  const callbacks = useMutationWithInvalidation(
    [queryKeys.autoServiceProfile()],
    'createSuccess',
    'createError',
    'myService.profile'
  );

  return useMutation({
    mutationFn: (data: CreateProfileRequest) =>
      autoServiceProfileService.createProfile(data, selectedAutoServiceId || undefined),
    ...callbacks,
  });
}

/**
 * Hook for updating profile
 */
export function useUpdateProfile() {
  const { selectedAutoServiceId } = useAutoServiceStore();
  const callbacks = useMutationWithInvalidation(
    [queryKeys.autoServiceProfile()],
    'updateSuccess',
    'updateError',
    'myService.profile'
  );

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      autoServiceProfileService.updateProfile(data, selectedAutoServiceId || undefined),
    ...callbacks,
  });
}
