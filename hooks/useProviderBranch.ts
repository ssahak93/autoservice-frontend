'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useMemo, useEffect } from 'react';

import { providerBranchService } from '@/lib/services/provider-branch.service';
import { useProviderStore } from '@/stores/providerStore';
import { useUIStore } from '@/stores/uiStore';

import { useAuth } from './useAuth';

/**
 * Hook for managing provider branch (renamed from profile)
 * Follows Single Responsibility Principle - handles branch data fetching and mutations
 */
export function useProviderBranch(providerId: string | null) {
  const t = useTranslations('myService');
  const { user } = useAuth();
  const { showToast } = useUIStore();
  const { selectedProviderId, setSelectedProviderId } = useProviderStore();
  const queryClient = useQueryClient();

  // Get user's owned provider IDs
  const userOwnedProviderIds = useMemo(
    () => user?.providers?.map((p) => p.id) || [],
    [user?.providers]
  );

  // Validate and get valid selectedProviderId
  const validSelectedProviderId = useMemo(() => {
    const id = providerId || selectedProviderId;

    if (!id) {
      // If no selection, use first owned provider
      return userOwnedProviderIds[0] || null;
    }

    // Check if selected provider belongs to user
    if (userOwnedProviderIds.includes(id)) {
      return id;
    }

    // Invalid selection, use first owned provider
    return userOwnedProviderIds[0] || null;
  }, [providerId, selectedProviderId, userOwnedProviderIds]);

  // Set valid selectedProviderId if it changed
  useEffect(() => {
    if (validSelectedProviderId && validSelectedProviderId !== selectedProviderId) {
      setSelectedProviderId(validSelectedProviderId);
    }
  }, [validSelectedProviderId, selectedProviderId, setSelectedProviderId]);

  // Query for branch - only when we have a valid provider ID
  const {
    data: branch,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['providerBranch', validSelectedProviderId],
    queryFn: async () => {
      if (!validSelectedProviderId) {
        throw new Error('Provider ID is required');
      }
      try {
        return await providerBranchService.getBranch(validSelectedProviderId);
      } catch (err: unknown) {
        // If branch doesn't exist (404), return null instead of throwing
        // This allows us to show the create branch form
        const error = err as { response?: { status?: number } };
        if (error?.response?.status === 404 || error?.response?.status === 400) {
          return null;
        }
        throw err;
      }
    },
    // Only enable when we have a valid provider ID
    enabled: !!validSelectedProviderId,
    refetchOnMount: true, // Enable refetch on mount to check for new branch
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  // Publish/Unpublish mutation
  const publishMutation = useMutation({
    mutationFn: (isPublished: boolean) =>
      providerBranchService.publishBranch(isPublished, validSelectedProviderId || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providerBranch'] });
      showToast(
        branch?.isPublished
          ? t('unpublishSuccess', { defaultValue: 'Branch unpublished successfully' })
          : t('publishSuccess', { defaultValue: 'Branch published successfully' }),
        'success'
      );
    },
    onError: (error: Error) => {
      showToast(
        error.message || t('publishError', { defaultValue: 'Failed to update publish status' }),
        'error'
      );
    },
  });

  // Check if branch is not found
  const isBranchNotFound = useMemo(() => {
    const errorObj = error as { response?: { status?: number }; message?: string } | null;
    return (
      errorObj &&
      (errorObj?.response?.status === 404 ||
        errorObj?.response?.status === 400 ||
        errorObj?.response?.status === 500 ||
        errorObj?.message?.includes('not found') ||
        errorObj?.message?.includes('Branch not found'))
    );
  }, [error]);

  return {
    branch,
    isLoading,
    error,
    isBranchNotFound: isBranchNotFound || (!isLoading && !branch && !error),
    validSelectedProviderId,
    publishMutation,
    refetch,
  };
}
