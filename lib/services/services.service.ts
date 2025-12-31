import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { AutoService, PaginatedResponse } from '@/types';

export interface ServiceSearchParams {
  city?: string;
  region?: string;
  district?: string;
  serviceType?: string;
  minRating?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'distance' | 'reviews' | 'newest';
  query?: string; // Text search query (for future backend support)
}

export const servicesService = {
  async search(params: ServiceSearchParams): Promise<PaginatedResponse<AutoService>> {
    // Clean params - remove undefined values to ensure they're sent
    const cleanParams: Record<string, unknown> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = value;
      }
    });

    const response = await apiClient.get<{
      data: AutoService[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(API_ENDPOINTS.AUTO_SERVICES.SEARCH, {
      params: cleanParams,
    });
    // Backend returns { data, pagination } directly from search endpoint
    // Add success field to match PaginatedResponse type
    return {
      success: true,
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  async getById(id: string): Promise<AutoService> {
    const response = await apiClient.get<AutoService | { success: boolean; data: AutoService }>(
      API_ENDPOINTS.AUTO_SERVICES.DETAIL(id)
    );
    // Handle both wrapped and unwrapped responses
    const responseData = response.data;
    if ('success' in responseData && 'data' in responseData) {
      return responseData.data;
    }
    return responseData as AutoService;
  },

  async getReviews(serviceId: string, params?: { page?: number; limit?: number; sortBy?: string }) {
    const response = await apiClient.get(API_ENDPOINTS.AUTO_SERVICES.REVIEWS(serviceId), {
      params,
    });
    return response.data;
  },
};
