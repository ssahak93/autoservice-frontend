import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { unwrapArrayResponse } from '@/lib/utils/api-response';

export interface SearchSuggestion {
  query: string;
  count?: number;
  type: 'popular' | 'recent' | 'suggestion';
}

export const searchSuggestionsService = {
  /**
   * Get search suggestions
   */
  async getSuggestions(query: string, limit: number = 8): Promise<SearchSuggestion[]> {
    if (!query || query.length < 2) {
      // Return popular searches if query is too short
      return this.getPopularSearches(limit);
    }

    try {
      const response = await apiClient.get<
        SearchSuggestion[] | { success: boolean; data: SearchSuggestion[] }
      >(API_ENDPOINTS.SEARCH.SUGGESTIONS, {
        params: {
          query,
          limit,
        },
      });
      return unwrapArrayResponse(response);
    } catch (error) {
      console.error('Failed to fetch search suggestions:', error);
      return [];
    }
  },

  /**
   * Get popular searches
   */
  async getPopularSearches(limit: number = 5): Promise<SearchSuggestion[]> {
    try {
      const response = await apiClient.get<
        SearchSuggestion[] | { success: boolean; data: SearchSuggestion[] }
      >(API_ENDPOINTS.SEARCH.SUGGESTIONS, {
        params: {
          limit,
        },
      });
      return unwrapArrayResponse(response);
    } catch (error) {
      console.error('Failed to fetch popular searches:', error);
      return [];
    }
  },
};
