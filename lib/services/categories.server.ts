import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { serverApiClient } from '@/lib/api/server-client';

// Server client returns data directly, no unwrapping needed
import type { Category } from './categories.service';

export const categoriesServerService = {
  /**
   * Get all active categories (server-side)
   */
  async getAll(): Promise<Category[]> {
    try {
      const response = await serverApiClient.get<
        Category[] | { success: boolean; data: Category[] }
      >(API_ENDPOINTS.CATEGORIES.LIST);
      // serverApiClient.get() returns data directly (not AxiosResponse)
      // Handle both direct array and wrapped response
      if (Array.isArray(response)) {
        return response;
      }
      if (response && typeof response === 'object' && 'data' in response) {
        return (response as { success: boolean; data: Category[] }).data || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [];
    }
  },

  /**
   * Get category by code (server-side)
   */
  async getByCode(code: string): Promise<Category | null> {
    try {
      const response = await serverApiClient.get<Category | { success: boolean; data: Category }>(
        API_ENDPOINTS.CATEGORIES.BY_CODE(code)
      );
      // serverApiClient.get() returns data directly (not AxiosResponse)
      // Handle both direct object and wrapped response
      if (response && typeof response === 'object') {
        if ('data' in response && 'success' in response) {
          return (response as { success: boolean; data: Category }).data;
        }
        // Check if it's a Category object (has id, code, name)
        if ('id' in response && 'code' in response && 'name' in response) {
          return response as Category;
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch category:', error);
      return null;
    }
  },
};
