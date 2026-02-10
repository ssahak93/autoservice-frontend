'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys, queryConfig } from '@/lib/api/query-config';
import {
  notificationsService,
  type NotificationFilters,
} from '@/lib/services/notifications.service';
import { isAuthenticated } from '@/lib/utils/auth-check';
import { useMutationWithInvalidation } from '@/lib/utils/mutation-helpers';
import { useAuthStore } from '@/stores/authStore';

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
    refetchInterval: queryConfig.refetchIntervals.notifications,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to get notification statistics
 * Automatically refetches every 30 seconds to keep stats up to date
 * Only fetches if user is authenticated and has a token
 */
export function useNotificationStats() {
  const { isAuthenticated: isAuthFromStore, accessToken } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.notificationStats(),
    queryFn: () => notificationsService.getStats(),
    enabled: isAuthFromStore && isAuthenticated(accessToken), // Only fetch if user is authenticated and has token
    staleTime: queryConfig.staleTime,
    gcTime: queryConfig.gcTime,
    refetchInterval: queryConfig.refetchIntervals.stats,
    retry: false, // Don't retry - service will return default stats on error
    // Suppress error logging for this query as 401 is expected for unauthenticated users
    meta: {
      errorMessage: undefined, // Prevent React Query from logging errors
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
  const callbacks = useMutationWithInvalidation(
    [['notifications'], ['notifications', 'stats']],
    'allMarkedAsRead',
    undefined,
    'notifications'
  );

  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    ...callbacks,
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
  const callbacks = useMutationWithInvalidation(
    [['notifications'], ['notifications', 'stats']],
    'allReadDeleted',
    undefined,
    'notifications'
  );

  return useMutation({
    mutationFn: () => notificationsService.deleteAllRead(),
    ...callbacks,
  });
}
