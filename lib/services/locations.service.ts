/**
 * Locations service for fetching Armenia location data
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export interface Location {
  code: string;
  name: string;
  districts?: Array<{ code: string; name: string }>;
}

export interface DistrictWithBounds {
  id: string;
  code: string;
  name: string;
  centerLat: number;
  centerLng: number;
  bounds: GeoJSON.Polygon | null; // GeoJSON polygon or null
}

export interface City extends Location {
  regionCode: string;
  regionName: string;
}

export const locationsService = {
  /**
   * Get all regions (marzes) of Armenia
   */
  async getRegions(): Promise<Location[]> {
    const response = await apiClient.get<Location[]>(API_ENDPOINTS.LOCATIONS.REGIONS);
    return response.data;
  },

  /**
   * Get all cities
   */
  async getCities(regionCode?: string): Promise<City[]> {
    const url = regionCode
      ? `${API_ENDPOINTS.LOCATIONS.CITIES}?region=${regionCode}`
      : API_ENDPOINTS.LOCATIONS.CITIES;
    const response = await apiClient.get<City[]>(url);
    return response.data;
  },

  /**
   * Get districts for a city (only Yerevan has districts)
   */
  async getDistricts(cityCode: string): Promise<Location[]> {
    const response = await apiClient.get<Location[]>(
      `${API_ENDPOINTS.LOCATIONS.DISTRICTS}?city=${cityCode}`
    );
    return response.data;
  },

  /**
   * Get districts with GeoJSON bounds for interactive map visualization
   */
  async getDistrictsWithBounds(cityCode: string): Promise<DistrictWithBounds[]> {
    const response = await apiClient.get<DistrictWithBounds[]>(
      `${API_ENDPOINTS.LOCATIONS.DISTRICTS_WITH_BOUNDS}?city=${cityCode}`
    );
    return response.data;
  },
};
