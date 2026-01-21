'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { autoServicesService } from '@/lib/services/auto-services.service';
import { useAutoServiceStore } from '@/stores/autoServiceStore';
import { useUIStore } from '@/stores/uiStore';

/**
 * Hook for auto service mutations
 * Follows Single Responsibility Principle - handles only mutation logic
 */
export function useDeleteAutoService() {
  const t = useTranslations('myService');
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();
  const { selectedAutoServiceId, setSelectedAutoServiceId } = useAutoServiceStore();

  return useMutation({
    mutationFn: (serviceId: string) => autoServicesService.deleteAutoService(serviceId),
    onSuccess: async (_, serviceId) => {
      showToast(
        t('servicesList.deleteSuccess', { defaultValue: 'Auto service deleted successfully' }),
        'success'
      );
      // Invalidate and refetch
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['availableAutoServices'] }),
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }),
      ]);
      // Clear selection if deleted service was selected
      if (selectedAutoServiceId && serviceId === selectedAutoServiceId) {
        setSelectedAutoServiceId(null);
      }
    },
    onError: (error: unknown) => {
      const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        errorObj?.response?.data?.message ||
        errorObj?.message ||
        t('servicesList.deleteError', { defaultValue: 'Failed to delete auto service' });
      showToast(errorMessage, 'error');
    },
  });
}

/**
 * Hook for creating auto service
 */
export function useCreateAutoService() {
  const t = useTranslations('myService.create');
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();
  const { setSelectedAutoServiceId, setAvailableAutoServices } = useAutoServiceStore();

  return useMutation({
    mutationFn: (data: Parameters<typeof autoServicesService.createAutoService>[0]) =>
      autoServicesService.createAutoService(data),
    onSuccess: async (newService) => {
      showToast(
        t('createSuccess', { defaultValue: 'Auto service created successfully' }),
        'success'
      );
      // Invalidate queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['availableAutoServices'] }),
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }),
      ]);
      // Select the newly created service
      setSelectedAutoServiceId(newService.id);
      // Update available services in store
      const response = await autoServicesService.getAvailableAutoServices();
      const services = Array.isArray(response) ? response : response.data || [];
      setAvailableAutoServices(services);
    },
    onError: (error: unknown) => {
      const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        errorObj?.response?.data?.message ||
        errorObj?.message ||
        t('createError', { defaultValue: 'Failed to create auto service' });
      showToast(errorMessage, 'error');
    },
  });
}
