import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { unwrapResponseData } from '@/lib/utils/api-response';

export interface Category {
  id: string;
  code: string;
  name: string;
  nameHy: string;
  nameRu: string;
  icon?: string | null;
  isActive: boolean;
  serviceTypes?: Array<{
    id: string;
    name: string;
    nameHy: string;
    nameRu: string;
    icon?: string | null;
  }>;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

export interface CategoryResponse {
  success: boolean;
  data: Category;
}

export const categoriesService = {
  /**
   * Get all active categories
   */
  async getAll(): Promise<Category[]> {
    const response = await apiClient.get<CategoriesResponse>(API_ENDPOINTS.CATEGORIES.LIST);
    const unwrapped = unwrapResponseData(response);
    return Array.isArray(unwrapped) ? unwrapped : unwrapped.data || [];
  },

  /**
   * Get category by code
   */
  async getByCode(code: string): Promise<Category | null> {
    try {
      const response = await apiClient.get<CategoryResponse>(
        API_ENDPOINTS.CATEGORIES.BY_CODE(code)
      );
      const unwrapped = unwrapResponseData(response);
      return unwrapped.data || unwrapped;
    } catch {
      return null;
    }
  },
};
