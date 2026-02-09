import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { vehiclesService } from '@/lib/services/vehicles.service';
import type { CreateVehicleRequest, UpdateVehicleRequest } from '@/types';

const VEHICLES_QUERY_KEY = ['vehicles'] as const;

/**
 * Get all vehicles for current user
 */
export function useVehicles() {
  return useQuery({
    queryKey: VEHICLES_QUERY_KEY,
    queryFn: () => vehiclesService.getList(),
  });
}

/**
 * Get vehicle by ID
 */
export function useVehicle(vehicleId: string | undefined) {
  return useQuery({
    queryKey: [...VEHICLES_QUERY_KEY, vehicleId],
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVehicleRequest) => vehiclesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY });
    },
  });
}

/**
 * Update vehicle mutation
 */
export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vehicleId, data }: { vehicleId: string; data: UpdateVehicleRequest }) =>
      vehiclesService.update(vehicleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY });
    },
  });
}

/**
 * Delete vehicle mutation
 */
export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vehicleId: string) => vehiclesService.delete(vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY });
    },
  });
}
