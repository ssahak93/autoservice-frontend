/**
 * Utilities for checking authentication status
 *
 * Single Responsibility: Handle authentication state checks
 */

/**
 * Check if user has access token
 * Safely checks localStorage only on client side
 *
 * @returns True if access token exists
 */
export function hasAccessToken(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return !!localStorage.getItem('accessToken');
}

/**
 * Check if user has a valid token (either provided or in localStorage)
 * Can be used in hooks to conditionally enable queries
 *
 * @param accessToken - Optional access token from store
 * @returns True if user has token
 */
export function hasValidToken(accessToken?: string | null): boolean {
  if (accessToken) {
    return true;
  }
  return hasAccessToken();
}
