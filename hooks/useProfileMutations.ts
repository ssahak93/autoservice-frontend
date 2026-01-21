'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { queryKeys } from '@/lib/api/query-config';
import { autoServiceProfileService } from '@/lib/services/auto-service-profile.service';
import type {
  CreateProfileRequest,
  UpdateProfileRequest,
} from '@/lib/services/auto-service-profile.service';
import { useAutoServiceStore } from '@/stores/autoServiceStore';
import { useUIStore } from '@/stores/uiStore';

/**
 * Hook for profile mutations
 * Follows Single Responsibility Principle - handles only profile mutation logic
 */
export function useCreateProfile() {
  const t = useTranslations('myService.profile');
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();
  const { selectedAutoServiceId } = useAutoServiceStore();

  return useMutation({
    mutationFn: (data: CreateProfileRequest) =>
      autoServiceProfileService.createProfile(data, selectedAutoServiceId || undefined),
    onSuccess: () => {
      showToast(t('createSuccess', { defaultValue: 'Profile created successfully' }), 'success');
      queryClient.invalidateQueries({ queryKey: queryKeys.autoServiceProfile() });
    },
    onError: (error: unknown) => {
      const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        errorObj?.response?.data?.message ||
        errorObj?.message ||
        t('createError', { defaultValue: 'Failed to create profile' });
      showToast(errorMessage, 'error');
    },
  });
}

/**
 * Hook for updating profile
 */
export function useUpdateProfile() {
  const t = useTranslations('myService.profile');
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();
  const { selectedAutoServiceId } = useAutoServiceStore();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      autoServiceProfileService.updateProfile(data, selectedAutoServiceId || undefined),
    onSuccess: () => {
      showToast(t('updateSuccess', { defaultValue: 'Profile updated successfully' }), 'success');
      queryClient.invalidateQueries({ queryKey: queryKeys.autoServiceProfile() });
    },
    onError: (error: unknown) => {
      const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        errorObj?.response?.data?.message ||
        errorObj?.message ||
        t('updateError', { defaultValue: 'Failed to update profile' });
      showToast(errorMessage, 'error');
    },
  });
}
