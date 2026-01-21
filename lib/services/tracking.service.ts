import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export const trackingService = {
  /**
   * Отслеживает просмотр профиля
   */
  async trackView(profileId: string, viewDuration?: number): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.SEARCH.TRACK_VIEW(profileId), {
        viewDuration,
      });
    } catch (error) {
      // Игнорируем ошибки трекинга (не критично)
      console.error('Failed to track view:', error);
    }
  },

  /**
   * Отслеживает клик (звонок/сообщение)
   */
  async trackClick(profileId: string): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.SEARCH.TRACK_CLICK(profileId));
    } catch (error) {
      // Игнорируем ошибки трекинга (не критично)
      console.error('Failed to track click:', error);
    }
  },
};
