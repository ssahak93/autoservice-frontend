import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { useUIStore } from '@/stores/uiStore';

import { extractErrorMessage } from './errorHandler';

/**
 * Mutation helpers for common patterns
 *
 * Single Responsibility: Provide reusable mutation utilities
 * Open/Closed: Can be extended with new helpers without modifying existing code
 */

/**
 * Hook to get common mutation callbacks (onSuccess, onError) with toast notifications
 *
 * @param successMessage - Translation key or message for success
 * @param errorMessage - Translation key or message for error (optional)
 * @param namespace - Translation namespace (default: 'common')
 * @param onSuccessCallback - Additional callback on success
 * @returns Mutation callbacks object
 */
export function useMutationCallbacks<TData, TError>(
  successMessage: string,
  errorMessage?: string,
  namespace: string = 'common',
  onSuccessCallback?: (data: TData) => void
) {
  const { showToast } = useUIStore();
  const t = useTranslations(namespace);

  return {
    onSuccess: (data: TData) => {
      showToast(t(successMessage, { defaultValue: successMessage }), 'success');
      onSuccessCallback?.(data);
    },
    onError: (error: TError) => {
      const message = errorMessage
        ? t(errorMessage, { defaultValue: errorMessage })
        : extractErrorMessage(error);
      showToast(message, 'error');
    },
  };
}

/**
 * Hook to get mutation callbacks with query invalidation
 *
 * @param queryKeys - Query keys to invalidate on success
 * @param successMessage - Translation key or message for success
 * @param errorMessage - Translation key or message for error (optional)
 * @param namespace - Translation namespace (default: 'common')
 * @returns Mutation callbacks object
 */
export function useMutationWithInvalidation<TData, TError>(
  queryKeys: (string | string[])[],
  successMessage: string,
  errorMessage?: string,
  namespace: string = 'common'
) {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();
  const t = useTranslations(namespace);

  return {
    onSuccess: (_data: TData) => {
      showToast(t(successMessage, { defaultValue: successMessage }), 'success');
      // Invalidate all specified query keys
      queryKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
      });
    },
    onError: (error: TError) => {
      const message = errorMessage
        ? t(errorMessage, { defaultValue: errorMessage })
        : extractErrorMessage(error);
      showToast(message, 'error');
    },
  };
}

/**
 * Extract error message from mutation error for display
 *
 * @param error - Error from mutation
 * @param fallback - Fallback message if extraction fails
 * @returns Error message string
 */
export function getMutationErrorMessage(error: unknown, fallback: string): string {
  const message = extractErrorMessage(error);
  return message && !message.includes('status code') && !message.includes('Request failed')
    ? message
    : fallback;
}
