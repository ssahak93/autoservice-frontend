import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { unwrapResponseData } from '@/lib/utils/api-response';
import { buildQueryParams } from '@/lib/utils/params';

export interface Notification {
  id: string;
  userId: string;
  type:
    | 'visit_confirmed'
    | 'visit_cancelled'
    | 'visit_reminder'
    | 'new_message'
    | 'review_received'
    | 'system';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: Notification['type'];
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
}

export const notificationsService = {
  /**
   * Get user notifications
   */
  async getNotifications(filters?: NotificationFilters) {
    const queryParams = buildQueryParams(filters || {}, false);

    const response = await apiClient.get<
      | {
          data: Notification[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        }
      | {
          success: boolean;
          data: {
            data: Notification[];
            pagination: {
              page: number;
              limit: number;
              total: number;
              totalPages: number;
            };
          };
        }
    >(API_ENDPOINTS.NOTIFICATIONS.LIST, {
      params: queryParams,
    });
    return unwrapResponseData(response);
  },

  /**
   * Get notification statistics
   * Returns default stats if request fails (fallback for error cases)
   * Note: This should only be called when user is authenticated
   */
  async getStats(): Promise<NotificationStats> {
    try {
      const response = await apiClient.get<
        NotificationStats | { success: boolean; data: NotificationStats }
      >(API_ENDPOINTS.NOTIFICATIONS.STATS);
      return unwrapResponseData(response);
    } catch (error) {
      // If request fails (e.g., 401, 404, 500), return default stats as fallback
      // This prevents UI errors and provides graceful degradation

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (
          axiosError.response?.status === 401 ||
          axiosError.response?.status === 404 ||
          axiosError.response?.status === 500
        ) {
          // Return default stats silently - don't log errors for optional endpoints
          return {
            total: 0,
            unread: 0,
            byType: {},
          };
        }
      }
      // Re-throw other errors (network errors, etc.)
      throw error;
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.put(API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(notificationId));
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.put(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ);
  },

  /**
   * Delete notification
   */
  async delete(notificationId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(notificationId));
  },

  /**
   * Delete all read notifications
   */
  async deleteAllRead(): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE_ALL_READ);
  },
};
