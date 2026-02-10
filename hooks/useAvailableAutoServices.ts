'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { SERVICE_TYPE } from '@/lib/constants/service-type.constants';
import { autoServicesService } from '@/lib/services/auto-services.service';
import type { AutoServiceOption } from '@/stores/autoServiceStore';

import { useAuth } from './useAuth';

/**
 * Hook for fetching available auto services
 * Follows Single Responsibility Principle - handles only data fetching
 */
export function useAvailableAutoServices() {
  const { user } = useAuth();

  const { data: availableServices = [], isLoading } = useQuery({
    queryKey: ['availableAutoServices'],
    queryFn: () => autoServicesService.getAvailableAutoServices(),
    enabled: !!user,
    refetchOnMount: true, // Always refetch to get latest data
  });

  // Get owned services from API
  const ownedServices = useMemo(() => {
    return availableServices.filter((s) => s && s.role === 'owner');
  }, [availableServices]);

  // Get owned services from user data as fallback
  const ownedServicesFromUser = useMemo(() => {
    return (
      user?.autoServices?.map((s): AutoServiceOption => {
        const result: AutoServiceOption = {
          id: s.id,
          name:
            s.serviceType === SERVICE_TYPE.COMPANY
              ? s.companyName || 'My Service'
              : `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'My Service',
          role: 'owner',
          serviceType: s.serviceType,
          hasProfile: false, // We don't know from user data, will be updated by API
        };

        if (s.companyName) result.companyName = s.companyName;
        if (s.firstName) result.firstName = s.firstName;
        if (s.lastName) result.lastName = s.lastName;
        if (s.avatarFile) result.avatarFile = s.avatarFile;

        return result;
      }) || []
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
