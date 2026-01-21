'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { queryKeys, queryConfig } from '@/lib/api/query-config';
import {
  notificationsService,
  type NotificationFilters,
} from '@/lib/services/notifications.service';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

/**
 * Hook to get user notifications
 * Only fetches if user is authenticated
 */
export function useNotifications(filters?: NotificationFilters) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.notifications(filters),
    queryFn: () => notificationsService.getNotifications(filters),
    enabled: isAuthenticated, // Only fetch if user is authenticated
    staleTime: queryConfig.staleTime,
    gcTime: queryConfig.gcTime,
    refetchInterval: 30000, // Poll every 30 seconds
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to get notification statistics
 * Automatically refetches every 30 seconds to keep stats up to date
 * Only fetches if user is authenticated and has a token
 */
export function useNotificationStats() {
  const { isAuthenticated, accessToken } = useAuthStore();

  // Also check localStorage for token (in case store hasn't synced yet)
  const hasToken =
    typeof window !== 'undefined' && (!!accessToken || !!localStorage.getItem('accessToken'));

  return useQuery({
    queryKey: queryKeys.notificationStats(),
    queryFn: () => notificationsService.getStats(),
    enabled: isAuthenticated && hasToken, // Only fetch if user is authenticated and has token
    staleTime: queryConfig.staleTime,
    gcTime: queryConfig.gcTime,
    refetchInterval: 30000, // Poll every 30 seconds
    retry: (failureCount, error) => {
      // Don't retry on 401/404/500 errors (unauthorized or service will return default stats)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (
          axiosError.response?.status === 401 ||
          axiosError.response?.status === 404 ||
          axiosError.response?.status === 500
        ) {
          return false;
        }
      }
      // Retry other errors (network errors, etc.) up to 3 times
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
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationStats() });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationStats() });
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
