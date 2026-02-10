import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { unwrapResponseData, unwrapArrayResponse } from '@/lib/utils/api-response';
import type { Vehicle, CreateVehicleRequest, UpdateVehicleRequest } from '@/types';

export const vehiclesService = {
  /**
   * Get all vehicles for current user
   */
  async getList(): Promise<Vehicle[]> {
    const response = await apiClient.get<Vehicle[] | { success: boolean; data: Vehicle[] }>(
      API_ENDPOINTS.VEHICLES.LIST
    );
    return unwrapArrayResponse(response);
  },

  /**
   * Get vehicle by ID
   */
  async getById(vehicleId: string): Promise<Vehicle> {
    const response = await apiClient.get<Vehicle | { success: boolean; data: Vehicle }>(
      API_ENDPOINTS.VEHICLES.GET(vehicleId)
    );
    return unwrapResponseData(response);
  },

  /**
   * Create a new vehicle
   */
  async create(data: CreateVehicleRequest): Promise<Vehicle> {
    const response = await apiClient.post<Vehicle | { success: boolean; data: Vehicle }>(
      API_ENDPOINTS.VEHICLES.CREATE,
      data
    );
    return unwrapResponseData(response);
  },

  /**
   * Update vehicle
   */
  async update(vehicleId: string, data: UpdateVehicleRequest): Promise<Vehicle> {
    const response = await apiClient.put<Vehicle | { success: boolean; data: Vehicle }>(
      API_ENDPOINTS.VEHICLES.UPDATE(vehicleId),
      data
    );
    return unwrapResponseData(response);
  },

  /**
   * Delete vehicle (soft delete)
   */
  async delete(vehicleId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.VEHICLES.DELETE(vehicleId));
  },
};
