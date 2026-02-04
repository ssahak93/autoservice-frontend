/**
 * Review-specific error handling utilities
 * Follows Single Responsibility Principle - handles only review-related errors
 */

interface ReviewError {
  response?: {
    data?: {
      error?: {
        message?: string;
        code?: string;
      };
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

export interface ReviewErrorInfo {
  message: string;
  isAlreadyReported: boolean;
  isNotFound: boolean;
  isForbidden: boolean;
}

/**
 * Extract review-specific error information
 */
export function extractReviewError(error: unknown): ReviewErrorInfo {
  const errorObj = error as ReviewError;

  const message =
    errorObj?.response?.data?.error?.message ||
    errorObj?.response?.data?.message ||
    errorObj?.message ||
    'An unexpected error occurred';

  const isAlreadyReported =
    message.toLowerCase().includes('already reported') ||
    errorObj?.response?.data?.error?.code === 'BadRequestException';

  const isNotFound =
    message.toLowerCase().includes('not found') || errorObj?.response?.status === 404;

  const isForbidden =
    message.toLowerCase().includes('forbidden') || errorObj?.response?.status === 403;

  return {
    message,
    isAlreadyReported,
    isNotFound,
    isForbidden,
  };
}

/**
 * Get user-friendly error message for review operations
 */
export function getReviewErrorMessage(
  error: unknown,
  t: (key: string, options?: { defaultValue?: string }) => string
): string {
  const errorInfo = extractReviewError(error);

  if (errorInfo.isAlreadyReported) {
    return t('alreadyReported', { defaultValue: 'You have already reported this review' });
  }

  if (errorInfo.isNotFound) {
    return t('reviewNotFound', { defaultValue: 'Review not found' });
  }

  if (errorInfo.isForbidden) {
    return t('notAuthorized', { defaultValue: 'You are not authorized to perform this action' });
  }

  return errorInfo.message;
}
