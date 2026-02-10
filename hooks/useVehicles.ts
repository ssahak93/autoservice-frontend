import { useQuery, useMutation } from '@tanstack/react-query';

import { queryKeys } from '@/lib/api/query-config';
import { vehiclesService } from '@/lib/services/vehicles.service';
import { useMutationWithInvalidation } from '@/lib/utils/mutation-helpers';
import type { CreateVehicleRequest, UpdateVehicleRequest } from '@/types';

/**
 * Get all vehicles for current user
 */
export function useVehicles() {
  return useQuery({
    queryKey: queryKeys.vehicles(),
    queryFn: () => vehiclesService.getList(),
  });
}

/**
 * Get vehicle by ID
 */
export function useVehicle(vehicleId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.vehicle(vehicleId || ''),
    queryFn: () => {
      if (!vehicleId) {
        throw new Error('Vehicle ID is required');
      }
      return vehiclesService.getById(vehicleId);
    },
    enabled: !!vehicleId,
  });
}

/**
 * Create vehicle mutation
 */
export function useCreateVehicle() {
  const callbacks = useMutationWithInvalidation(
    [queryKeys.vehicles()],
    'Vehicle created successfully',
    'Failed to create vehicle'
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
    'Vehicle updated successfully',
    'Failed to update vehicle'
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
    'Vehicle deleted successfully',
    'Failed to delete vehicle'
  );

  return useMutation({
    mutationFn: (vehicleId: string) => vehiclesService.delete(vehicleId),
    ...callbacks,
  });
}
