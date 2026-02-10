/**
 * Locations service for fetching Armenia location data
 * Updated for new architecture: Region -> Community (city/village/district)
 */

import type { Locale } from '@/i18n/routing';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { unwrapArrayResponse, unwrapResponseData } from '@/lib/utils/api-response';

export interface Region {
  id: string;
  code: string;
  name: string;
}

export interface Community {
  id: string;
  code: string;
  name: string;
  type: 'city' | 'village' | 'district';
  regionId: string;
  regionCode: string;
  regionName: string;
}

export const locationsService = {
  /**
   * Get all regions (marzes) of Armenia
   */
  async getRegions(): Promise<Region[]> {
    const response = await apiClient.get<Region[] | { success: boolean; data: Region[] }>(
      API_ENDPOINTS.LOCATIONS.REGIONS
    );
    return unwrapArrayResponse(response);
  },

  /**
   * Get all communities (cities, villages, districts)
   * @param regionId - Optional filter by region ID
   * @param type - Optional filter by community type (city, village, district)
   */
  async getCommunities(
    regionId?: string,
    type?: 'city' | 'village' | 'district'
  ): Promise<Community[]> {
    const params = new URLSearchParams();
    if (regionId) params.append('regionId', regionId);
    if (type) params.append('type', type);

    const url = params.toString()
      ? `${API_ENDPOINTS.LOCATIONS.COMMUNITIES}?${params.toString()}`
      : API_ENDPOINTS.LOCATIONS.COMMUNITIES;

    const response = await apiClient.get<Community[] | { success: boolean; data: Community[] }>(
      url
    );
    return unwrapArrayResponse(response);
  },

  /**
   * Reverse geocode coordinates to address
   * Uses backend API (Nominatim) for address text only
   */
  async reverseGeocodeAddress(
    latitude: number,
    longitude: number,
    locale: Locale = 'en'
  ): Promise<{
    address: string;
    addressHy: string | null;
    addressRu: string | null;
  }> {
    const response = await apiClient.get<
      | {
          address: string;
          addressHy: string | null;
          addressRu: string | null;
        }
      | {
          success: boolean;
          data: {
            address: string;
            addressHy: string | null;
            addressRu: string | null;
          };
        }
    >(
      `${API_ENDPOINTS.GEOCODING.REVERSE}?latitude=${latitude}&longitude=${longitude}&locale=${locale}`
    );
    return unwrapResponseData(response);
  },
};
