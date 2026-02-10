/**
 * React Query helper utilities
 *
 * Single Responsibility: Provide reusable query configuration patterns
 */

/**
 * Placeholder data helper - keeps previous data while fetching new data
 * Improves UX by showing stale data instead of loading state
 *
 * @param previousData - Previous query data
 * @returns Previous data if available, undefined otherwise
 */
export function keepPreviousData<T>(previousData: T | undefined): T | undefined {
  return previousData;
}

/**
 * Common query options for authenticated queries
 * Only fetches if user is authenticated
 */
export const authenticatedQueryOptions = {
  enabled: true, // Will be overridden by individual hooks
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  placeholderData: keepPreviousData,
} as const;
