import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { unwrapResponseData, unwrapPaginatedResponse } from '@/lib/utils/api-response';
import { cleanParams } from '@/lib/utils/params';
import type { AutoService, PaginatedResponse } from '@/types';

export interface ServiceSearchParams {
  businessTypes?: Array<
    | 'auto_service'
    | 'auto_shop'
    | 'car_wash'
    | 'cleaning'
    | 'tire_service'
    | 'towing'
    | 'tinting'
    | 'other'
  >;
  regionId?: string;
  communityId?: string;
  serviceTypes?: string[];
  minRating?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'distance' | 'reviews' | 'newest';
  query?: string; // Text search query
}

export const servicesService = {
  async search(params: ServiceSearchParams): Promise<PaginatedResponse<AutoService>> {
    const cleanedParams = cleanParams(params);

    const response = await apiClient.get<
      | {
          data: AutoService[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        }
      | PaginatedResponse<AutoService>
      | { success: boolean; data: PaginatedResponse<AutoService> }
    >(API_ENDPOINTS.AUTO_SERVICES.SEARCH, {
      params: cleanedParams,
    });
    // Backend returns { data, pagination } directly from search endpoint
    return unwrapPaginatedResponse(response);
  },

  async getById(id: string): Promise<AutoService> {
    const response = await apiClient.get<AutoService | { success: boolean; data: AutoService }>(
      API_ENDPOINTS.AUTO_SERVICES.DETAIL(id)
    );
    return unwrapResponseData(response);
  },

  async getReviews(serviceId: string, params?: { page?: number; limit?: number; sortBy?: string }) {
    const response = await apiClient.get<
      PaginatedResponse<Review> | { success: boolean; data: PaginatedResponse<Review> } | Review[]
    >(API_ENDPOINTS.AUTO_SERVICES.REVIEWS(serviceId), {
      params,
    });
    return unwrapPaginatedResponse(response);
  },
};
