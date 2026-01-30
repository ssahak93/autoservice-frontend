'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { autoServicesService } from '@/lib/services/auto-services.service';

import { useAuth } from './useAuth';

/**
 * Hook for fetching available auto services
 * Follows Single Responsibility Principle - handles only data fetching
 */
export function useAvailableAutoServices() {
  const { user } = useAuth();

  const { data: availableServicesResponse, isLoading } = useQuery({
    queryKey: ['availableAutoServices'],
    queryFn: async () => {
      try {
        const response = await autoServicesService.getAvailableAutoServices();
        // Response can be either { data: [...] } or directly an array
        return Array.isArray(response) ? response : response.data || [];
      } catch (error) {
        console.error('Failed to fetch available auto services:', error);
        return [];
      }
    },
    enabled: !!user,
    refetchOnMount: true, // Always refetch to get latest data
  });

  // Ensure availableServices is always an array
  const availableServices = useMemo(() => {
    return Array.isArray(availableServicesResponse) ? availableServicesResponse : [];
  }, [availableServicesResponse]);

  // Get owned services from API
  const ownedServices = useMemo(() => {
    return availableServices.filter((s) => s && s.role === 'owner');
  }, [availableServices]);

  // Get owned services from user data as fallback
  const ownedServicesFromUser = useMemo(() => {
    return (
      user?.autoServices?.map((s) => ({
        id: s.id,
        name:
          s.serviceType === 'company'
            ? s.companyName || 'My Service'
            : `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'My Service',
        role: 'owner' as const,
        serviceType: s.serviceType,
        companyName: s.companyName,
        firstName: s.firstName,
        lastName: s.lastName,
        isApproved: s.isApproved,
        avatarFile: s.avatarFile || null,
        hasProfile: false, // We don't know from user data, will be updated by API
      })) || []
    );
  }, [user?.autoServices]);

  // Use API data if available, otherwise fallback to user data
  const finalOwnedServices = useMemo(() => {
    return ownedServices.length > 0 ? ownedServices : ownedServicesFromUser;
  }, [ownedServices, ownedServicesFromUser]);

  return {
    availableServices,
    ownedServices: finalOwnedServices,
    isLoading,
  };
}
