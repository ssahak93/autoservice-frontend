/**
 * Navigation utilities
 *
 * Single Responsibility: Handle navigation-related logic
 */

/**
 * Normalize URL by removing locale prefix
 *
 * @param url - URL with optional locale prefix
 * @returns URL without locale prefix
 */
export function normalizeUrl(url: string): string {
  return url.replace(/^\/(hy|en|ru)(\/|$)/, '/');
}

/**
 * Get redirect URL from session storage
 *
 * @returns Redirect URL or null
 */
export function getRedirectUrl(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return sessionStorage.getItem('redirectAfterLogin');
}

/**
 * Clear redirect URL from session storage
 */
export function clearRedirectUrl(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('redirectAfterLogin');
  }
}

/**
 * Get redirect URL and clear it
 *
 * @returns Normalized redirect URL or null
 */
export function getAndClearRedirectUrl(): string | null {
  const url = getRedirectUrl();
  if (url) {
    clearRedirectUrl();
    return normalizeUrl(url);
  }
  return null;
}
