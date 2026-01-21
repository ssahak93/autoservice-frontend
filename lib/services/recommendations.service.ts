import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { AutoService } from '@/types';

export interface RecommendationParams {
  userId?: string;
  lat?: number;
  lng?: number;
  businessType?: string;
}

export interface ServiceRecommendation extends AutoService {
  reason?: string;
  score?: number;
}

export const recommendationsService = {
  async getRecommendations(params?: RecommendationParams): Promise<ServiceRecommendation[]> {
    const queryParams: Record<string, unknown> = {};
    if (params?.userId) queryParams.userId = params.userId;
    if (params?.lat) queryParams.lat = params.lat;
    if (params?.lng) queryParams.lng = params.lng;
    if (params?.businessType) queryParams.businessType = params.businessType;

    const response = await apiClient.get<ServiceRecommendation[]>(
      API_ENDPOINTS.SEARCH.RECOMMENDATIONS,
      { params: Object.keys(queryParams).length > 0 ? queryParams : undefined }
    );

    return response.data;
  },
};
