import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { unwrapArrayResponse } from '@/lib/utils/api-response';

export interface SearchHistoryItem {
  id: string;
  query?: string | null;
  businessType?: string | null;
  city?: string | null;
  region?: string | null;
  district?: string | null;
  serviceType?: string | null;
  resultCount: number;
  createdAt: string;
}

export interface ViewHistoryItem {
  id: string;
  autoServiceProfileId: string;
  viewDuration?: number | null;
  createdAt: string;
  autoServiceProfile?: {
    id: string;
    autoService: {
      id: string;
      companyName?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      avatarFile?: {
        id: string;
        fileUrl: string;
      } | null;
    };
  };
}

export const historyService = {
  /**
   * Получает недавние поиски
   */
  async getRecentSearches(limit: number = 10): Promise<SearchHistoryItem[]> {
    const response = await apiClient.get<
      SearchHistoryItem[] | { success: boolean; data: SearchHistoryItem[] }
    >(API_ENDPOINTS.SEARCH.RECENT_SEARCHES, {
      params: { limit },
    });
    return unwrapArrayResponse(response);
  },

  /**
   * Получает недавние просмотры
   */
  async getRecentViews(limit: number = 10): Promise<ViewHistoryItem[]> {
    const response = await apiClient.get<
      ViewHistoryItem[] | { success: boolean; data: ViewHistoryItem[] }
    >(API_ENDPOINTS.SEARCH.RECENT_VIEWS, {
      params: { limit },
    });
    return unwrapArrayResponse(response);
  },

  /**
   * Очищает историю поиска
   */
  async clearSearchHistory(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.SEARCH.CLEAR_SEARCHES);
  },

  /**
   * Очищает историю просмотров
   */
  async clearViewHistory(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.SEARCH.CLEAR_VIEWS);
  },
};
