import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

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
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.isRead !== undefined) params.append('isRead', filters.isRead.toString());
    if (filters?.type) params.append('type', filters.type);

    const response = await apiClient.get<{
      data: Notification[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(API_ENDPOINTS.NOTIFICATIONS.LIST, {
      params: Object.fromEntries(params),
    });
    return response.data;
  },

  /**
   * Get notification statistics
   * Returns default stats if endpoint doesn't exist (404)
   * Silently handles 404 to prevent console errors
   */
  async getStats(): Promise<NotificationStats> {
    try {
      const response = await apiClient.get<NotificationStats>(API_ENDPOINTS.NOTIFICATIONS.STATS);
      return response.data;
    } catch (error) {
      // If endpoint doesn't exist (404), return default stats silently
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          // Endpoint doesn't exist yet, return default stats
          // This is expected behavior if the endpoint hasn't been implemented yet
          return {
            total: 0,
            unread: 0,
            byType: {},
          };
        }
      }
      // Re-throw other errors
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
