'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { SERVICE_TYPE } from '@/lib/constants/service-type.constants';
import { providersService } from '@/lib/services/providers.service';
import type { ProviderOption } from '@/stores/providerStore';

import { useAuth } from './useAuth';

/**
 * Hook for fetching available providers
 * Follows Single Responsibility Principle - handles only data fetching
 */
export function useAvailableProviders() {
  const { user } = useAuth();

  const { data: availableProviders = [], isLoading } = useQuery({
    queryKey: ['availableProviders'],
    queryFn: () => providersService.getAvailableProviders(),
    enabled: !!user,
    refetchOnMount: true, // Always refetch to get latest data
  });

  // Get owned providers from API
  const ownedProviders = useMemo(() => {
    return availableProviders.filter((p) => p && p.role === 'owner');
  }, [availableProviders]);

  // Get owned providers from user data as fallback
  const ownedProvidersFromUser = useMemo(() => {
    return (
      user?.providers?.map((p): ProviderOption => {
        const result: ProviderOption = {
          id: p.id,
          name:
            p.serviceType === SERVICE_TYPE.COMPANY
              ? p.companyName || 'My Provider'
              : `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'My Provider',
          role: 'owner',
          serviceType: p.serviceType,
          hasBranch: false, // We don't know from user data, will be updated by API
        };

        if (p.companyName) result.companyName = p.companyName;
        if (p.firstName) result.firstName = p.firstName;
        if (p.lastName) result.lastName = p.lastName;
        if (p.avatarFile) result.avatarFile = p.avatarFile;

        return result;
      }) || []
    );
  }, [user?.providers]);

  // Use API data if available, otherwise fallback to user data
  const finalOwnedProviders = useMemo(() => {
    return ownedProviders.length > 0 ? ownedProviders : ownedProvidersFromUser;
  }, [ownedProviders, ownedProvidersFromUser]);

  return {
    availableProviders,
    ownedProviders: finalOwnedProviders,
    isLoading,
  };
}
