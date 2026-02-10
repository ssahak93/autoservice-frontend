import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { unwrapArrayResponse } from '@/lib/utils/api-response';

export interface ServiceType {
  id: string;
  name: string;
  nameHy?: string;
  nameRu?: string;
  code: string;
  category: {
    id: string;
    code: string;
    name: string;
  };
  group?: {
    id: string;
    code: string;
    name: string;
  };
  // Added by useServiceTypes hook for localization
  displayName?: string;
}

export interface ServiceCategory {
  id: string;
  code: string;
  name: string;
}

export const serviceTypesService = {
  /**
   * Get all service types
   */
  async getAll(): Promise<ServiceType[]> {
    const response = await apiClient.get<
      ServiceType[] | { success: boolean; data: ServiceType[] } | { data: ServiceType[] }
    >(API_ENDPOINTS.SERVICE_TYPES.LIST);
    return unwrapArrayResponse(response);
  },

  /**
   * Get service types by category
   */
  async getByCategory(category: string): Promise<ServiceType[]> {
    const response = await apiClient.get<
      ServiceType[] | { success: boolean; data: ServiceType[] } | { data: ServiceType[] }
    >(API_ENDPOINTS.SERVICE_TYPES.BY_CATEGORY(category));
    return unwrapArrayResponse(response);
  },

  /**
   * Get service types by category and group
   */
  async getByCategoryAndGroup(category: string, group: string): Promise<ServiceType[]> {
    const response = await apiClient.get<
      ServiceType[] | { success: boolean; data: ServiceType[] } | { data: ServiceType[] }
    >(API_ENDPOINTS.SERVICE_TYPES.BY_CATEGORY_AND_GROUP(category, group));
    return unwrapArrayResponse(response);
  },
};
