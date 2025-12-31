'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { settingsService, type UpdateSettingsData } from '@/lib/services/settings.service';
import { useUIStore } from '@/stores/uiStore';

/**
 * Hook to get user settings
 */
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update user settings
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();
  const t = useTranslations('profile.settings');

  return useMutation({
    mutationFn: (data: UpdateSettingsData) => settingsService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      showToast(t('updated', { defaultValue: 'Settings updated successfully' }), 'success');
    },
    onError: (error: Error) => {
      showToast(
        error.message || t('updateError', { defaultValue: 'Failed to update settings' }),
        'error'
      );
    },
  });
}

/**
 * Hook to update a single setting
 */
export function useUpdateSetting() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();
  const t = useTranslations('profile.settings');

  return useMutation({
    mutationFn: ({
      category,
      key,
      value,
    }: {
      category: 'notifications' | 'privacy' | 'security';
      key: string;
      value: boolean | string;
    }) => settingsService.updateSetting(category, key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error: Error) => {
      showToast(
        error.message || t('updateError', { defaultValue: 'Failed to update setting' }),
        'error'
      );
    },
  });
}
