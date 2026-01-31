/**
 * Centralized error handling utilities
 */

export interface ErrorInfo {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

/**
 * Extract user-friendly error message from various error types
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown> & {
      response?: {
        data?: {
          error?: { message?: string; details?: { message?: string } };
          message?: string;
        };
      };
    };

    // Check for backend error response format: { success: false, error: { message: string } }
    // Priority 1: error.response.data.error.message (most specific)
    if (
      errorObj.response?.data?.error?.message &&
      typeof errorObj.response.data.error.message === 'string'
    ) {
      return errorObj.response.data.error.message;
    }

    // Priority 2: error.response.data.error.details.message (fallback in details)
    if (
      errorObj.response?.data?.error?.details?.message &&
      typeof errorObj.response.data.error.details.message === 'string'
    ) {
      return errorObj.response.data.error.details.message;
    }

    // Priority 3: error.error.message (direct error object)
    if (errorObj.error && typeof errorObj.error === 'object') {
      const errorData = errorObj.error as Record<string, unknown>;
      if (errorData.message && typeof errorData.message === 'string') {
        return errorData.message;
      }
    }

    // Priority 4: error.response.data.message
    if (errorObj.response?.data?.message && typeof errorObj.response.data.message === 'string') {
      return errorObj.response.data.message;
    }

    // Priority 5: error.message (but only if not a generic HTTP error)
    if (errorObj.message && typeof errorObj.message === 'string') {
      // Skip generic HTTP error messages
      if (
        !errorObj.message.includes('status code') &&
        !errorObj.message.includes('Request failed')
      ) {
        return errorObj.message;
      }
    }
  }

  return 'An unexpected error occurred';
}

/**
 * Extract error code from error object
 */
export function extractErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown> & {
      code?: string;
      response?: {
        data?: {
          code?: string;
        };
      };
    };

    if (errorObj.code && typeof errorObj.code === 'string') {
      return errorObj.code;
    }

    if (errorObj.response?.data?.code && typeof errorObj.response.data.code === 'string') {
      return errorObj.response.data.code;
    }
  }

  return undefined;
}

/**
 * Extract HTTP status code from error
 */
export function extractErrorStatus(error: unknown): number | undefined {
  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown> & {
      status?: number;
      response?: {
        status?: number;
      };
    };

    if (errorObj.status && typeof errorObj.status === 'number') {
      return errorObj.status;
    }

    if (errorObj.response?.status && typeof errorObj.response.status === 'number') {
      return errorObj.response.status;
    }
  }

  return undefined;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;

    // Axios network errors
    if (errorObj.message && typeof errorObj.message === 'string') {
      return (
        errorObj.message.includes('Network Error') ||
        errorObj.message.includes('timeout') ||
        errorObj.message.includes('ECONNREFUSED')
      );
    }

    // No response means network error
    if (!errorObj.response) {
      return true;
    }
  }

  return false;
}

/**
 * Check if error is a 401 Unauthorized error
 */
export function isUnauthorizedError(error: unknown): boolean {
  const status = extractErrorStatus(error);
  return status === 401;
}

/**
 * Check if error is a 403 Forbidden error
 */
export function isForbiddenError(error: unknown): boolean {
  const status = extractErrorStatus(error);
  return status === 403;
}

/**
 * Check if error is a 404 Not Found error
 */
export function isNotFoundError(error: unknown): boolean {
  const status = extractErrorStatus(error);
  return status === 404;
}

/**
 * Check if error is a 409 Conflict error
 */
export function isConflictError(error: unknown): boolean {
  const status = extractErrorStatus(error);
  return status === 409;
}

/**
 * Check if error is a 500+ server error
 */
export function isServerError(error: unknown): boolean {
  const status = extractErrorStatus(error);
  return status !== undefined && status >= 500;
}

/**
 * Check if error is a "No refresh token" error (should be silently handled)
 */
export function isNoRefreshTokenError(error: unknown): boolean {
  const message = extractErrorMessage(error);
  return (
    message.toLowerCase().includes('no refresh token') ||
    message.toLowerCase().includes('refresh token')
  );
}

/**
 * Get user-friendly error message based on error type
 */
export function getUserFriendlyErrorMessage(error: unknown, fallback?: string): string {
  if (isNetworkError(error)) {
    return 'Network connection error. Please check your internet connection and try again.';
  }

  if (isUnauthorizedError(error)) {
    return 'Your session has expired. Please log in again.';
  }

  if (isForbiddenError(error)) {
    return 'You do not have permission to perform this action.';
  }

  if (isNotFoundError(error)) {
    return 'The requested resource was not found.';
  }

  if (isServerError(error)) {
    return 'Server error. Please try again later.';
  }

  const message = extractErrorMessage(error);
  return message || fallback || 'An unexpected error occurred. Please try again.';
}

/**
 * Log error for debugging (can be extended to send to error tracking service)
 */
export function logError(error: unknown, context?: string): void {
  // Don't log "No refresh token" errors - they're expected and handled silently
  if (isNoRefreshTokenError(error)) {
    return;
  }

  const errorInfo: ErrorInfo = {
    message: extractErrorMessage(error),
    code: extractErrorCode(error),
    status: extractErrorStatus(error),
    details: error,
  };

  if (context) {
    console.error(`[${context}]`, errorInfo);
  } else {
    console.error('[Error]', errorInfo);
  }

  // TODO: Send to error tracking service (e.g., Sentry, LogRocket)
  // if (process.env.NODE_ENV === 'production') {
  //   errorTrackingService.captureException(error, { extra: errorInfo, tags: { context } });
  // }
}
