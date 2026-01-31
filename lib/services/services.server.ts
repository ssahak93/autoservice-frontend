/**
 * Server-side services for auto services
 * Used in Next.js App Router server components
 */

import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { serverApiClient } from '@/lib/api/server-client';
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

/**
 * Backend search response structure
 */
interface BackendSearchResponse {
  data: Array<{
    id: string;
    name: string;
    serviceType: string;
    businessType?: string;
    description: string;
    address: string;
    addressHy?: string;
    addressRu?: string;
    community?: string;
    region?: string;
    communityType?: 'city' | 'village' | 'district';
    averageRating: number | null;
    totalReviews: number;
    distance?: number;
    services: Array<{
      id: string;
      name: string;
      category: string;
    }>;
    avatarUrl: string | null;
    isApproved: boolean; // Approval status from AutoService (primary table)
    isBlocked?: boolean; // Blocked services should not be shown in public
    blockedReason?: string | null;
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
  businessType?:
    | 'auto_service'
    | 'auto_shop'
    | 'car_wash'
    | 'cleaning'
    | 'tire_service'
    | 'towing'
    | 'tinting'
    | 'other';
  description: string | null;
  specialization: string | null;
  yearsOfExperience: number | null;
  address: string;
  addressHy?: string;
  addressRu?: string;
  community?: string;
  region?: string;
  communityType?: 'city' | 'village' | 'district';
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
  isApproved: boolean; // Approval status from profile
  isBlocked?: boolean; // Blocked services should not be shown in public
  blockedReason?: string | null;
  avatarFileId: string | null;
  avatarUrl: string | null;
}

/**
 * Transform backend search response to frontend AutoService format
 */
function transformSearchResult(result: BackendSearchResponse['data'][0]): AutoService {
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
    address: result.address || '',
    addressHy: result.addressHy,
    addressRu: result.addressRu,
    community: result.community,
    region: result.region,
    communityType: result.communityType,
    latitude: 0, // Will be set from detail if needed
    longitude: 0, // Will be set from detail if needed
    averageRating: result.averageRating ? Number(result.averageRating) : undefined,
    totalReviews: result.totalReviews,
    isApproved: result.isApproved,
    isBlocked: result.isBlocked || false,
    blockedReason: result.blockedReason || undefined,
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
  // Safely split name, handling empty or single-word names
  const nameParts = (response.name || '').trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Backend now returns URLs directly, so use them as-is
  const profilePhotoUrls = response.profilePhotoFileIds || [];
  const workPhotoUrls = response.workPhotoFileIds || [];

  return {
    id: response.id,
    serviceType: response.serviceType,
    businessType: response.businessType,
    companyName: response.serviceType === 'company' ? response.name || undefined : undefined,
    firstName: response.serviceType === 'individual' ? firstName || undefined : undefined,
    lastName: response.serviceType === 'individual' ? lastName || undefined : undefined,
    description: response.description || undefined,
    specialization: response.specialization || undefined,
    address: response.address,
    addressHy: response.addressHy,
    addressRu: response.addressRu,
    community: response.community,
    region: response.region,
    communityType: response.communityType,
    latitude: response.latitude,
    longitude: response.longitude,
    phoneNumber: response.phoneNumber || undefined,
    workingHours: response.workingHours || undefined,
    averageRating: response.averageRating ? Number(response.averageRating) : undefined,
    totalReviews: response.totalReviews,
    isApproved: response.isApproved,
    isBlocked: response.isBlocked || false,
    blockedReason: response.blockedReason || undefined,
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
        // Handle arrays (for multiple selections)
        if (Array.isArray(value) && value.length > 0) {
          cleanParams[key] = value;
        } else if (!Array.isArray(value)) {
          cleanParams[key] = value;
        }
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
      // Handle 404 errors gracefully - return null instead of throwing
      if (error instanceof Error) {
        const errorWithStatus = error as { status?: number; code?: string };
        if (
          errorWithStatus.status === 404 ||
          errorWithStatus.code === 'NOT_FOUND' ||
          error.message.includes('404') ||
          error.message.includes('not found') ||
          error.message.includes('չի գտնվել')
        ) {
          return null;
        }
      }
      throw error;
    }
  },
};
