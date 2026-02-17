'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import { queryKeys, queryConfig } from '@/lib/api/query-config';
import { settingsService, type UpdateSettingsData } from '@/lib/services/settings.service';
import { useMutationWithInvalidation } from '@/lib/utils/mutation-helpers';

/**
 * Hook to get user settings
 */
export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings(),
    queryFn: () => settingsService.getSettings(),
    staleTime: queryConfig.staleTime, // 5 minutes (same as default)
    gcTime: queryConfig.gcTime,
  });
}

/**
 * Hook to update user settings
 */
export function useUpdateSettings() {
  const callbacks = useMutationWithInvalidation(
    [...queryKeys.settings()] as string[],
    'updated',
    'updateError',
    'profile.settings'
  );

  return useMutation({
    mutationFn: (data: UpdateSettingsData) => settingsService.updateSettings(data),
    ...callbacks,
  });
}

/**
 * Hook to update a single setting
 */
export function useUpdateSetting() {
  const callbacks = useMutationWithInvalidation(
    [...queryKeys.settings()] as string[],
    'updated',
    'updateError',
    'profile.settings'
  );

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
    ...callbacks,
  });
}
