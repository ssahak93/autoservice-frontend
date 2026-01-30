'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { autoServiceProfileService } from '@/lib/services/auto-service-profile.service';
import { useUIStore } from '@/stores/uiStore';

/**
 * Hook for service info mutations
 * Follows Single Responsibility Principle - handles only service info mutation logic
 */
export function useUpdateServiceInfo() {
  const t = useTranslations('myService.info');
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ autoServiceId, data }: { autoServiceId: string; data: unknown }) =>
      autoServiceProfileService.updateServiceInfo(autoServiceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autoServiceProfile'] });
      queryClient.invalidateQueries({ queryKey: ['availableAutoServices'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      showToast(
        t('updateSuccess', { defaultValue: 'Service information updated successfully' }),
        'success'
      );
    },
    onError: (error: unknown) => {
      const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        errorObj?.response?.data?.message ||
        errorObj?.message ||
        t('updateError', { defaultValue: 'Failed to update service information' });
      showToast(errorMessage, 'error');
    },
  });
}
