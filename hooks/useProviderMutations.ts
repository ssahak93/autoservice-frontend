'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { providersService } from '@/lib/services/providers.service';
import type { ProviderRole } from '@/lib/services/team.service';
import { getMutationErrorMessage } from '@/lib/utils/mutation-helpers';
import { useProviderStore } from '@/stores/providerStore';
import { useUIStore } from '@/stores/uiStore';

/**
 * Hook for provider mutations
 * Follows Single Responsibility Principle - handles only mutation logic
 */
export function useDeleteProvider() {
  const t = useTranslations('myService');
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();
  const { selectedProviderId, setSelectedProviderId } = useProviderStore();

  return useMutation({
    mutationFn: (providerId: string) => providersService.deleteProvider(providerId),
    onSuccess: async (_, providerId) => {
      showToast(
        t('servicesList.deleteSuccess', { defaultValue: 'Provider deleted successfully' }),
        'success'
      );
      // Invalidate and refetch
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['availableProviders'] }),
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }),
      ]);
      // Clear selection if deleted provider was selected
      if (selectedProviderId && providerId === selectedProviderId) {
        setSelectedProviderId(null);
      }
    },
    onError: (error: unknown) => {
      const errorMessage = getMutationErrorMessage(
        error,
        t('servicesList.deleteError', { defaultValue: 'Failed to delete provider' })
      );
      showToast(errorMessage, 'error');
    },
  });
}

/**
 * Hook for creating provider
 */
export function useCreateProvider() {
  const t = useTranslations('myService.create');
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();
  const { setSelectedProviderId, setAvailableProviders } = useProviderStore();

  return useMutation({
    mutationFn: (data: Parameters<typeof providersService.createProvider>[0]) =>
      providersService.createProvider(data),
    onSuccess: async (newProvider) => {
      showToast(t('createSuccess', { defaultValue: 'Provider created successfully' }), 'success');
      // Invalidate queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['availableProviders'] }),
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }),
      ]);
      // Select the newly created provider
      setSelectedProviderId(newProvider.id);
      // Update available providers in store
      const response = await providersService.getAvailableProviders();
      const providers = Array.isArray(response)
        ? response
        : (response as { data?: typeof response })?.data || [];
      // Map providers to ProviderOption format with proper role type
      const mappedProviders = providers.map((provider) => ({
        id: provider.id,
        name: provider.name,
        role: (provider.role as ProviderRole) || ('owner' as const),
        serviceType: provider.serviceType,
        companyName: provider.companyName ?? undefined,
        firstName: provider.firstName ?? undefined,
        lastName: provider.lastName ?? undefined,
        avatarFile: provider.avatarFile ?? undefined,
        hasBranch: provider.hasBranch,
        isApproved: provider.isApproved,
      }));
      setAvailableProviders(mappedProviders);
    },
    onError: (error: unknown) => {
      const errorMessage = getMutationErrorMessage(
        error,
        t('createError', { defaultValue: 'Failed to create provider' })
      );
      showToast(errorMessage, 'error');
    },
  });
}
