/**
 * Server-side services for auto services
 * Used in Next.js App Router server components
 */

import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { serverApiClient } from '@/lib/api/server-client';
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

/**
 * Backend search response structure
 */
interface BackendSearchResponse {
  data: Array<{
    id: string;
    name: string;
    serviceType: string;
    description: string;
    city: string;
    region: string;
    district?: string;
    averageRating: number | null;
    totalReviews: number;
    distance?: number;
    services: Array<{
      id: string;
      name: string;
      category: string;
    }>;
    avatarUrl: string | null;
    isVerified: boolean;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Backend detail response structure
 */
interface BackendDetailResponse {
  id: string;
  name: string;
  serviceType: 'individual' | 'company';
  description: string | null;
  specialization: string | null;
  yearsOfExperience: number | null;
  address: string;
  city: string;
  region: string;
  district?: string | null;
  latitude: number;
  longitude: number;
  phoneNumber: string | null;
  workingHours: Record<string, { open: string; close: string }> | null;
  services: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  profilePhotoFileIds: string[]; // Backend returns URLs, not IDs
  workPhotoFileIds: string[]; // Backend returns URLs, not IDs
  averageRating: number | null;
  totalReviews: number;
  isVerified: boolean;
  avatarFileId: string | null;
  avatarUrl: string | null;
}

/**
 * Transform backend search response to frontend AutoService format
 */
function transformSearchResult(result: BackendSearchResponse['data'][0]): AutoService {
  const [firstName, ...lastNameParts] = result.name.split(' ');
  const lastName = lastNameParts.join(' ') || '';

  return {
    id: result.id,
    serviceType: result.serviceType as 'individual' | 'company',
    companyName: result.serviceType === 'company' ? result.name : undefined,
    firstName: result.serviceType === 'individual' ? firstName : undefined,
    lastName: result.serviceType === 'individual' ? lastName : undefined,
    description: result.description || undefined,
    address: `${result.city}, ${result.region}`, // Backend search doesn't return address, use city/region
    city: result.city,
    region: result.region,
    district: result.district || undefined,
    latitude: 0, // Will be set from detail if needed
    longitude: 0, // Will be set from detail if needed
    averageRating: result.averageRating ? Number(result.averageRating) : undefined,
    totalReviews: result.totalReviews,
    isVerified: result.isVerified,
    avatarFile: result.avatarUrl
      ? {
          fileUrl: result.avatarUrl,
        }
      : undefined,
    specialization: result.services?.[0]?.name || undefined,
  };
}

/**
 * Transform backend detail response to frontend AutoService format
 */
function transformDetailResponse(response: BackendDetailResponse): AutoService {
  const [firstName, ...lastNameParts] = response.name.split(' ');
  const lastName = lastNameParts.join(' ') || '';

  // Backend now returns URLs directly, so use them as-is
  const profilePhotoUrls = response.profilePhotoFileIds || [];
  const workPhotoUrls = response.workPhotoFileIds || [];

  return {
    id: response.id,
    serviceType: response.serviceType,
    companyName: response.serviceType === 'company' ? response.name : undefined,
    firstName: response.serviceType === 'individual' ? firstName : undefined,
    lastName: response.serviceType === 'individual' ? lastName : undefined,
    description: response.description || undefined,
    specialization: response.specialization || undefined,
    address: response.address,
    city: response.city,
    region: response.region,
    district: response.district || undefined,
    latitude: response.latitude,
    longitude: response.longitude,
    phoneNumber: response.phoneNumber || undefined,
    workingHours: response.workingHours || undefined,
    averageRating: response.averageRating ? Number(response.averageRating) : undefined,
    totalReviews: response.totalReviews,
    isVerified: response.isVerified,
    avatarFile: response.avatarUrl
      ? {
          fileUrl: response.avatarUrl,
        }
      : undefined,
    services: response.services,
    profilePhotoFileIds: profilePhotoUrls,
    workPhotoFileIds: workPhotoUrls,
    yearsOfExperience: response.yearsOfExperience || undefined,
  };
}

export const servicesServerService = {
  /**
   * Search auto services (server-side)
   */
  async search(
    params: ServiceSearchParams,
    locale: string = 'hy'
  ): Promise<PaginatedResponse<AutoService>> {
    // Clean params - remove undefined values to ensure they're sent
    const cleanParams: Record<string, unknown> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = value;
      }
    });

    const response = await serverApiClient.get<BackendSearchResponse>(
      API_ENDPOINTS.AUTO_SERVICES.SEARCH,
      {
        params: cleanParams,
        headers: {
          'Accept-Language': locale,
        },
      }
    );

    return {
      success: true,
      data: response.data.map(transformSearchResult),
      pagination: response.pagination,
    };
  },

  /**
   * Get service by ID (server-side)
   */
  async getById(id: string, locale: string = 'hy'): Promise<AutoService | null> {
    try {
      const response = await serverApiClient.get<BackendDetailResponse>(
        API_ENDPOINTS.AUTO_SERVICES.DETAIL(id),
        {
          headers: {
            'Accept-Language': locale,
          },
        }
      );

      return transformDetailResponse(response);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  },
};
