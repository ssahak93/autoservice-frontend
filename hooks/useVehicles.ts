import { useQuery, useMutation } from '@tanstack/react-query';

import { queryKeys } from '@/lib/api/query-config';
import { vehiclesService } from '@/lib/services/vehicles.service';
import { hasValidToken } from '@/lib/utils/auth-check';
import { useMutationWithInvalidation } from '@/lib/utils/mutation-helpers';
import { useAuthStore } from '@/stores/authStore';
import type { CreateVehicleRequest, UpdateVehicleRequest } from '@/types';

/**
 * Get all vehicles for current user
 */
export function useVehicles() {
  const { accessToken } = useAuthStore();
  const isAuthenticated = hasValidToken(accessToken);

  return useQuery({
    queryKey: queryKeys.vehicles(),
    queryFn: () => vehiclesService.getList(),
    enabled: isAuthenticated, // Only fetch if user is authenticated
  });
}

/**
 * Get vehicle by ID
 */
export function useVehicle(vehicleId: string | undefined) {
  const { accessToken } = useAuthStore();
  const isAuthenticated = hasValidToken(accessToken);

  return useQuery({
    queryKey: queryKeys.vehicle(vehicleId || ''),
    queryFn: () => {
      if (!vehicleId) {
        throw new Error('Vehicle ID is required');
      }
      return vehiclesService.getById(vehicleId);
    },
    enabled: !!vehicleId && isAuthenticated, // Only fetch if vehicleId exists and user is authenticated
  });
}

/**
 * Create vehicle mutation
 */
export function useCreateVehicle() {
  const callbacks = useMutationWithInvalidation(
    [queryKeys.vehicles()],
    'vehicleCreated',
    'vehicleCreateError',
    'profile'
  );

  return useMutation({
    mutationFn: (data: CreateVehicleRequest) => vehiclesService.create(data),
    ...callbacks,
  });
}

/**
 * Update vehicle mutation
 */
export function useUpdateVehicle() {
  const callbacks = useMutationWithInvalidation(
    [queryKeys.vehicles()],
    'vehicleUpdated',
    'vehicleUpdateError',
    'profile'
  );

  return useMutation({
    mutationFn: ({ vehicleId, data }: { vehicleId: string; data: UpdateVehicleRequest }) =>
      vehiclesService.update(vehicleId, data),
    ...callbacks,
  });
}

/**
 * Delete vehicle mutation
 */
export function useDeleteVehicle() {
  const callbacks = useMutationWithInvalidation(
    [queryKeys.vehicles()],
    'vehicleDeleted',
    'vehicleDeleteError',
    'profile'
  );

  return useMutation({
    mutationFn: (vehicleId: string) => vehiclesService.delete(vehicleId),
    ...callbacks,
  });
}
