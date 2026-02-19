/**
 * Server-side services for providers
 * Used in Next.js App Router server components
 */

import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { serverApiClient } from '@/lib/api/server-client';
import { cleanParams } from '@/lib/utils/params';
import type { Provider, PaginatedResponse } from '@/types';

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

/**
 * Backend search response structure
 */
interface BackendSearchResponse {
  data: Array<{
    id: string;
    name: string;
    serviceType: string;
    description: string;
    address?: string;
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
      category?: string; // Category is optional now
    }>;
    avatarUrl: string | null;
    isApproved: boolean; // Approval status from Provider (primary table)
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
    category?: string; // Category is optional now
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
 * Transform backend search response to frontend Provider format
 */
function transformSearchResult(result: BackendSearchResponse['data'][0]): Provider {
  // Safely split name, handling empty or single-word names
  const nameParts = (result.name || '').trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Safely handle averageRating - can be number, string, or null
  let averageRating: number | undefined;
  if (result.averageRating != null) {
    const rating =
      typeof result.averageRating === 'string'
        ? parseFloat(result.averageRating)
        : Number(result.averageRating);
    averageRating = isNaN(rating) ? undefined : rating;
  }

  // Safely handle totalReviews - ensure it's a number
  const totalReviews =
    typeof result.totalReviews === 'number'
      ? result.totalReviews
      : typeof result.totalReviews === 'string'
        ? parseInt(result.totalReviews, 10)
        : 0;

  return {
    id: result.id || '',
    serviceType: (result.serviceType as 'individual' | 'company') || 'individual',
    companyName: result.serviceType === 'company' ? result.name || undefined : undefined,
    firstName: result.serviceType === 'individual' ? firstName || undefined : undefined,
    lastName: result.serviceType === 'individual' ? lastName || undefined : undefined,
    description: result.description || undefined,
    address: result.address || '',
    addressHy: result.addressHy || undefined,
    addressRu: result.addressRu || undefined,
    community: result.community || undefined,
    region: result.region || undefined,
    communityType: result.communityType || undefined,
    latitude: 0, // Will be set from detail if needed
    longitude: 0, // Will be set from detail if needed
    averageRating,
    totalReviews: isNaN(totalReviews) ? 0 : totalReviews,
    isApproved: result.isApproved ?? false,
    isBlocked: result.isBlocked ?? false,
    blockedReason: result.blockedReason || undefined,
    avatarFile: result.avatarUrl
      ? {
          fileUrl: result.avatarUrl,
        }
      : undefined,
    specialization: result.services?.[0]?.name || undefined,
    // Transform services array, preserving category (optional)
    services: Array.isArray(result.services)
      ? result.services.map((service) => ({
          id: service?.id || '',
          name: service?.name || '',
          category: service?.category, // Category is optional now
        }))
      : undefined,
  };
}

/**
 * Transform backend detail response to frontend Provider format
 */
function transformDetailResponse(response: BackendDetailResponse): Provider {
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
    // Transform services array, preserving category (optional)
    services: response.services?.map((service) => ({
      id: service.id,
      name: service.name,
      category: service.category, // Category is optional now
    })),
    profilePhotoFileIds: profilePhotoUrls,
    workPhotoFileIds: workPhotoUrls,
    yearsOfExperience: response.yearsOfExperience || undefined,
  };
}

export const servicesServerService = {
  /**
   * Search providers (server-side)
   */
  async search(
    params: ServiceSearchParams,
    locale: string = 'hy'
  ): Promise<PaginatedResponse<Provider>> {
    const cleanedParams = cleanParams(params as Record<string, unknown>);

    const response = await serverApiClient.get<BackendSearchResponse>(
      API_ENDPOINTS.PROVIDERS.SEARCH,
      {
        params: cleanedParams,
        headers: {
          'Accept-Language': locale,
        },
      }
    );

    // Transform with error handling for each item
    const transformedData: Provider[] = [];
    for (const item of response.data) {
      try {
        transformedData.push(transformSearchResult(item));
      } catch (error) {
        // Log error but continue processing other items
        console.error('Error transforming provider:', item.id, error);
        // Skip this item - don't include it in results
      }
    }

    return {
      success: true,
      data: transformedData,
      pagination: response.pagination,
    };
  },

  /**
   * Get provider by ID (server-side)
   */
  async getById(id: string, locale: string = 'hy'): Promise<Provider | null> {
    try {
      const response = await serverApiClient.get<BackendDetailResponse>(
        API_ENDPOINTS.PROVIDERS.DETAIL(id),
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
