/**
 * Toast notification utilities
 *
 * Provides consistent error and success handling with toast notifications.
 * All toast notifications should use these utilities to avoid code duplication.
 */

import { getUserFriendlyErrorMessage } from './errorHandler';

/**
 * Show error toast with automatic error message extraction
 * @param error - Error object (can be any error type)
 * @param fallback - Fallback message if error cannot be extracted
 * @param showToast - Toast function from useUIStore
 */
export function showErrorToast(
  error: unknown,
  fallback: string,
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void
): void {
  const message = getUserFriendlyErrorMessage(error, fallback);
  showToast(message, 'error');
}

/**
 * Show success toast
 * @param message - Success message
 * @param showToast - Toast function from useUIStore
 */
export function showSuccessToast(
  message: string,
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void
): void {
  showToast(message, 'success');
}

/**
 * Handle mutation error with toast notification
 * Common pattern for React Query mutations
 * @param error - Error from mutation
 * @param fallback - Fallback error message
 * @param showToast - Toast function from useUIStore
 */
export function handleMutationError(
  error: unknown,
  fallback: string,
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void
): void {
  showErrorToast(error, fallback, showToast);
}

/**
 * Handle mutation success with toast notification
 * Common pattern for React Query mutations
 * @param message - Success message
 * @param showToast - Toast function from useUIStore
 */
export function handleMutationSuccess(
  message: string,
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void
): void {
  showSuccessToast(message, showToast);
}
