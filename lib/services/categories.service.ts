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
    const response = await apiClient.get<CategoriesResponse | Category[]>(
      API_ENDPOINTS.CATEGORIES.LIST
    );
    const unwrapped = unwrapResponseData(response);
    // Handle both array and wrapped response formats
    if (Array.isArray(unwrapped)) {
      return unwrapped;
    }
    // Type guard for wrapped response
    if (unwrapped && typeof unwrapped === 'object' && 'data' in unwrapped) {
      return (unwrapped as CategoriesResponse).data || [];
    }
    return [];
  },

  /**
   * Get category by code
   */
  async getByCode(code: string): Promise<Category | null> {
    try {
      const response = await apiClient.get<CategoryResponse | Category>(
        API_ENDPOINTS.CATEGORIES.BY_CODE(code)
      );
      const unwrapped = unwrapResponseData(response);
      // Handle both direct Category and wrapped CategoryResponse formats
      if (
        unwrapped &&
        typeof unwrapped === 'object' &&
        'data' in unwrapped &&
        'success' in unwrapped
      ) {
        const wrapped = unwrapped as CategoryResponse;
        return wrapped.data || null;
      }
      // If it's a direct Category object (has id, code, name properties)
      if (
        unwrapped &&
        typeof unwrapped === 'object' &&
        'id' in unwrapped &&
        'code' in unwrapped &&
        'name' in unwrapped
      ) {
        return unwrapped as Category;
      }
      return null;
    } catch {
      return null;
    }
  },
};
