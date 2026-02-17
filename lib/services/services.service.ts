import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { unwrapResponseData, unwrapPaginatedResponse } from '@/lib/utils/api-response';
import { cleanParams } from '@/lib/utils/params';
import type { Provider, PaginatedResponse, Review } from '@/types';

export interface ServiceSearchParams {
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
  async search(params: ServiceSearchParams): Promise<PaginatedResponse<Provider>> {
    const cleanedParams = cleanParams(params as Record<string, unknown>);

    const response = await apiClient.get<
      | {
          data: Provider[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        }
      | PaginatedResponse<Provider>
      | { success: boolean; data: PaginatedResponse<Provider> }
    >(API_ENDPOINTS.PROVIDERS.SEARCH, {
      params: cleanedParams,
    });
    // Backend returns { data, pagination } directly from search endpoint
    return unwrapPaginatedResponse(response);
  },

  async getById(id: string): Promise<Provider> {
    const response = await apiClient.get<Provider | { success: boolean; data: Provider }>(
      API_ENDPOINTS.PROVIDERS.DETAIL(id)
    );
    return unwrapResponseData(response);
  },

  async getReviews(serviceId: string, params?: { page?: number; limit?: number; sortBy?: string }) {
    const response = await apiClient.get<
      PaginatedResponse<Review> | { success: boolean; data: PaginatedResponse<Review> } | Review[]
    >(API_ENDPOINTS.PROVIDERS.REVIEWS(serviceId), {
      params,
    });
    return unwrapPaginatedResponse(response);
  },
};
