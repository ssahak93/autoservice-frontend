import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

interface FeatureFlag {
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  config?: Record<string, unknown>;
}

/**
 * Hook to check if a feature flag is enabled
 *
 * @param flagKey - The feature flag key to check
 * @param defaultValue - Default value if flag is not found (default: false)
 * @returns Object with isLoading, isEnabled, and error
 */
export function useFeatureFlag(flagKey: string, defaultValue: boolean = false) {
  const {
    data: flags,
    isLoading,
    error,
  } = useQuery<FeatureFlag[]>({
    queryKey: ['featureFlags'],
    queryFn: async () => {
      // Use public endpoint instead of admin endpoint
      const response = await apiClient.get<FeatureFlag[]>(API_ENDPOINTS.FEATURE_FLAGS.LIST);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  const flag = flags?.find((f) => f.key === flagKey);
  const isEnabled = flag?.enabled ?? defaultValue;

  return {
    isLoading,
    isEnabled,
    error,
    flag,
  };
}

/**
 * Hook to check multiple feature flags at once
 */
export function useFeatureFlags(flagKeys: string[]) {
  const {
    data: flags,
    isLoading,
    error,
  } = useQuery<FeatureFlag[]>({
    queryKey: ['featureFlags'],
    queryFn: async () => {
      // Use public endpoint instead of admin endpoint
      const response = await apiClient.get<FeatureFlag[]>(API_ENDPOINTS.FEATURE_FLAGS.LIST);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const result = flagKeys.reduce(
    (acc, key) => {
      const flag = flags?.find((f) => f.key === key);
      acc[key] = flag?.enabled ?? false;
      return acc;
    },
    {} as Record<string, boolean>
  );

  return {
    isLoading,
    flags: result,
    error,
  };
}
