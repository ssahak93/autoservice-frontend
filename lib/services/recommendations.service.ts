import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { unwrapArrayResponse } from '@/lib/utils/api-response';
import { buildQueryParams } from '@/lib/utils/params';
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

/**
 * Transform backend SearchResult to frontend AutoService format
 * Same transformation as in services.server.ts
 */
function transformRecommendationResult(result: {
  id: string;
  name: string;
  serviceType: string;
  businessType?: string;
  description: string;
  community?: string;
  region?: string;
  isApproved: boolean;
  latitude?: number;
  longitude?: number;
  averageRating: number | null;
  totalReviews: number;
  distance?: number;
  services: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  avatarUrl: string | null;
  score?: number;
  reason?: string;
}): ServiceRecommendation {
  // Safely split name, handling empty or single-word names
  const nameParts = (result.name || '').trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    id: result.id,
    serviceType: result.serviceType as 'individual' | 'company',
    businessType: result.businessType as
      | 'auto_service'
      | 'auto_shop'
      | 'car_wash'
      | 'cleaning'
      | 'tire_service'
      | 'towing'
      | 'tinting'
      | 'other'
      | undefined,
    companyName: result.serviceType === 'company' ? result.name || undefined : undefined,
    firstName: result.serviceType === 'individual' ? firstName || undefined : undefined,
    lastName: result.serviceType === 'individual' ? lastName || undefined : undefined,
    description: result.description || undefined,
    address: '', // Recommendations don't include address
    community: result.community,
    region: result.region,
    latitude: result.latitude || 0,
    longitude: result.longitude || 0,
    averageRating: result.averageRating ? Number(result.averageRating) : undefined,
    totalReviews: result.totalReviews,
    isApproved: result.isApproved,
    isBlocked: false,
    avatarFile: result.avatarUrl
      ? {
          fileUrl: result.avatarUrl,
        }
      : undefined,
    specialization: result.services?.[0]?.name || undefined,
    score: result.score,
    reason: result.reason,
  };
}

export const recommendationsService = {
  async getRecommendations(params?: RecommendationParams): Promise<ServiceRecommendation[]> {
    const queryParams = buildQueryParams(params || {}, false);

    const response = await apiClient.get<
      Array<{
        id: string;
        name: string;
        serviceType: string;
        businessType?: string;
        description: string;
        community?: string;
        region?: string;
        isApproved: boolean;
        latitude?: number;
        longitude?: number;
        averageRating: number | null;
        totalReviews: number;
        distance?: number;
        services: Array<{
          id: string;
          name: string;
          category: string;
        }>;
        avatarUrl: string | null;
        score?: number;
        reason?: string;
      }>
    >(API_ENDPOINTS.SEARCH.RECOMMENDATIONS, {
      params: queryParams,
    });

    // Transform backend SearchResult format to frontend AutoService format
    const data = unwrapArrayResponse(response);
    return data.map(transformRecommendationResult);
  },
};
