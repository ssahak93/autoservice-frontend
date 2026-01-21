'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useMemo, useEffect } from 'react';

import { autoServiceProfileService } from '@/lib/services/auto-service-profile.service';
import { useAutoServiceStore } from '@/stores/autoServiceStore';
import { useUIStore } from '@/stores/uiStore';

import { useAuth } from './useAuth';

/**
 * Hook for managing auto service profile
 * Follows Single Responsibility Principle - handles profile data fetching and mutations
 */
export function useAutoServiceProfile(autoServiceId: string | null) {
  const t = useTranslations('myService');
  const { user } = useAuth();
  const { showToast } = useUIStore();
  const { selectedAutoServiceId, setSelectedAutoServiceId } = useAutoServiceStore();
  const queryClient = useQueryClient();

  // Get user's owned service IDs
  const userOwnedServiceIds = useMemo(
    () => user?.autoServices?.map((s) => s.id) || [],
    [user?.autoServices]
  );

  // Validate and get valid selectedAutoServiceId
  const validSelectedAutoServiceId = useMemo(() => {
    const serviceId = autoServiceId || selectedAutoServiceId;

    if (!serviceId) {
      // If no selection, use first owned service
      return userOwnedServiceIds[0] || null;
    }

    // Check if selected service belongs to user
    if (userOwnedServiceIds.includes(serviceId)) {
      return serviceId;
    }

    // Invalid selection, use first owned service
    return userOwnedServiceIds[0] || null;
  }, [autoServiceId, selectedAutoServiceId, userOwnedServiceIds]);

  // Set valid selectedAutoServiceId if it changed
  useEffect(() => {
    if (validSelectedAutoServiceId && validSelectedAutoServiceId !== selectedAutoServiceId) {
      setSelectedAutoServiceId(validSelectedAutoServiceId);
    }
  }, [validSelectedAutoServiceId, selectedAutoServiceId, setSelectedAutoServiceId]);

  // Query for profile - only when we have a valid service ID
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['autoServiceProfile', validSelectedAutoServiceId],
    queryFn: async () => {
      if (!validSelectedAutoServiceId) {
        throw new Error('Auto service ID is required');
      }
      try {
        return await autoServiceProfileService.getProfile(validSelectedAutoServiceId);
      } catch (err: unknown) {
        // If profile doesn't exist (404), return null instead of throwing
        // This allows us to show the create profile form
        const error = err as { response?: { status?: number } };
        if (error?.response?.status === 404 || error?.response?.status === 400) {
          return null;
        }
        throw err;
      }
    },
    // Only enable when we have a valid service ID
    enabled: !!validSelectedAutoServiceId,
    refetchOnMount: true, // Enable refetch on mount to check for new profile
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  // Publish/Unpublish mutation
  const publishMutation = useMutation({
    mutationFn: (isPublished: boolean) =>
      autoServiceProfileService.publishProfile(
        isPublished,
        validSelectedAutoServiceId || undefined
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autoServiceProfile'] });
      showToast(
        profile?.isPublished
          ? t('unpublishSuccess', { defaultValue: 'Profile unpublished successfully' })
          : t('publishSuccess', { defaultValue: 'Profile published successfully' }),
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

  // Check if profile is not found
  const isProfileNotFound = useMemo(() => {
    const errorObj = error as { response?: { status?: number }; message?: string } | null;
    return (
      errorObj &&
      (errorObj?.response?.status === 404 ||
        errorObj?.response?.status === 400 ||
        errorObj?.response?.status === 500 ||
        errorObj?.message?.includes('not found') ||
        errorObj?.message?.includes('Profile not found'))
    );
  }, [error]);

  return {
    profile,
    isLoading,
    error,
    isProfileNotFound: isProfileNotFound || (!isLoading && !profile && !error),
    validSelectedAutoServiceId,
    publishMutation,
    refetch,
  };
}
