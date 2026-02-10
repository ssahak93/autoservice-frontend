import type { AxiosResponse } from 'axios';

import type { PaginatedResponse } from '@/types';

/**
 * API Response utilities
 *
 * Single Responsibility: Handle API response unwrapping
 * Open/Closed: Can be extended for new response formats without modifying existing code
 */

/**
 * Unwrap API response data
 * Backend may return data directly or wrapped in {success, data}
 *
 * @param response - Axios response
 * @returns Unwrapped data
 */
export function unwrapResponseData<T>(
  response: AxiosResponse<T | { success: boolean; data: T }>
): T {
  const data = response.data;

  // Check if response is wrapped in {success, data}
  if (
    data &&
    typeof data === 'object' &&
    'success' in data &&
    'data' in data &&
    (data as { success: boolean }).success
  ) {
    return (data as { success: boolean; data: T }).data;
  }

  // Return data directly
  return data as T;
}

/**
 * Extract error message from API error
 * Uses centralized errorHandler for consistency
 *
 * @param error - Error object (AxiosError or generic Error)
 * @param defaultMessage - Default error message if extraction fails
 * @returns Error message string
 */
export function extractErrorMessage(
  error: unknown,
  defaultMessage: string = 'An error occurred'
): string {
  // Import dynamically to avoid circular dependency
  const { extractErrorMessage: extractFromErrorHandler } = require('./errorHandler');
  const message = extractFromErrorHandler(error);
  return message || defaultMessage;
}

/**
 * Check if error is a specific HTTP status
 * Uses centralized errorHandler for consistency
 *
 * @param error - Error object
 * @param status - HTTP status code to check
 * @returns True if error has the specified status
 */
export function isErrorStatus(error: unknown, status: number): boolean {
  // Import dynamically to avoid circular dependency
  const { extractErrorStatus } = require('./errorHandler');
  const errorStatus = extractErrorStatus(error);
  return errorStatus === status;
}

/**
 * Unwrap array response data
 * Handles both direct arrays and wrapped arrays in { data: [...] }
 *
 * @param response - Axios response
 * @returns Unwrapped array
 */
export function unwrapArrayResponse<T>(response: AxiosResponse<T[] | { data?: T[] }>): T[] {
  const data = response.data;

  // If it's already an array, return it
  if (Array.isArray(data)) {
    return data;
  }

  // If it's wrapped in { data: [...] }
  if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
    return data.data;
  }

  // Fallback to empty array
  return [];
}

/**
 * Unwrap paginated response data
 * Handles multiple formats:
 * 1. Direct array - wraps in PaginatedResponse format
 * 2. PaginatedResponse - returns as is
 * 3. Wrapped PaginatedResponse - unwraps and returns
 * 4. { data: [...], pagination: {...} } - converts to PaginatedResponse
 *
 * @param response - Axios response
 * @returns PaginatedResponse with data and pagination info
 */
export function unwrapPaginatedResponse<T>(
  response: AxiosResponse<
    | T[]
    | PaginatedResponse<T>
    | { success: boolean; data: PaginatedResponse<T> }
    | { data: T[]; pagination: PaginatedResponse<T>['pagination'] }
  >
): PaginatedResponse<T> {
  const data = response.data;

  // If it's already a PaginatedResponse (with success, data, pagination)
  if (
    data &&
    typeof data === 'object' &&
    'data' in data &&
    'pagination' in data &&
    Array.isArray((data as PaginatedResponse<T>).data) &&
    'success' in data
  ) {
    const paginated = data as PaginatedResponse<T>;
    return {
      success: paginated.success ?? true,
      data: paginated.data,
      pagination: paginated.pagination,
    };
  }

  // If it's wrapped in { success, data: PaginatedResponse }
  if (
    data &&
    typeof data === 'object' &&
    'success' in data &&
    'data' in data &&
    (data as { success: boolean }).success
  ) {
    const wrappedData = (data as { data: unknown }).data;
    if (
      wrappedData &&
      typeof wrappedData === 'object' &&
      'data' in wrappedData &&
      'pagination' in wrappedData &&
      Array.isArray((wrappedData as PaginatedResponse<T>).data)
    ) {
      const wrapped = data as { success: boolean; data: PaginatedResponse<T> };
      return {
        success: wrapped.success,
        data: wrapped.data.data,
        pagination: wrapped.data.pagination,
      };
    }
  }

  // If it's { data: [...], pagination: {...} } format (without success field)
  if (
    data &&
    typeof data === 'object' &&
    'data' in data &&
    'pagination' in data &&
    Array.isArray((data as { data: T[] }).data) &&
    !('success' in data)
  ) {
    const withPagination = data as { data: T[]; pagination: PaginatedResponse<T>['pagination'] };
    return {
      success: true,
      data: withPagination.data,
      pagination: withPagination.pagination,
    };
  }

  // If it's a direct array, wrap it in PaginatedResponse format
  if (Array.isArray(data)) {
    return {
      success: true,
      data,
      pagination: {
        page: 1,
        limit: data.length,
        total: data.length,
        totalPages: 1,
      },
    };
  }

  // Fallback to empty paginated response
  return {
    success: true,
    data: [],
    pagination: {
      page: 1,
      limit: 0,
      total: 0,
      totalPages: 0,
    },
  };
}
