'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  notificationsService,
  type NotificationFilters,
} from '@/lib/services/notifications.service';
import { useUIStore } from '@/stores/uiStore';

/**
 * Hook to get user notifications
 */
export function useNotifications(filters?: NotificationFilters) {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => notificationsService.getNotifications(filters),
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

/**
 * Hook to get notification statistics
 * Silently handles 404 errors (endpoint may not exist yet)
 */
export function useNotificationStats() {
  return useQuery({
    queryKey: ['notifications', 'stats'],
    queryFn: () => notificationsService.getStats(),
    refetchInterval: 30000, // Poll every 30 seconds
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (endpoint doesn't exist)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          return false;
        }
      }
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
  });
}

/**
 * Hook to mark notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationsService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'stats'] });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();
  const t = useTranslations('notifications');

  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'stats'] });
      showToast(
        t('allMarkedAsRead', { defaultValue: 'All notifications marked as read' }),
        'success'
      );
    },
  });
}

/**
 * Hook to delete notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationsService.delete(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'stats'] });
    },
  });
}

/**
 * Hook to delete all read notifications
 */
export function useDeleteAllReadNotifications() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();
  const t = useTranslations('notifications');

  return useMutation({
    mutationFn: () => notificationsService.deleteAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'stats'] });
      showToast(t('allReadDeleted', { defaultValue: 'All read notifications deleted' }), 'success');
    },
  });
}
