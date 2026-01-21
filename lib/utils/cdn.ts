/**
 * CDN utility functions
 *
 * Provides CDN URLs for static assets when cdn_static_files feature flag is enabled
 */

const CDN_ENABLED = process.env.NEXT_PUBLIC_CDN_ENABLED === 'true';
const CDN_BASE_URL = process.env.NEXT_PUBLIC_CDN_BASE_URL || '';

/**
 * Get CDN URL for a static asset
 */
export function getCdnUrl(path: string): string {
  if (!CDN_ENABLED || !CDN_BASE_URL) {
    return path;
  }

  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Ensure CDN base URL doesn't end with slash
  const cleanCdnUrl = CDN_BASE_URL.endsWith('/') ? CDN_BASE_URL.slice(0, -1) : CDN_BASE_URL;

  return `${cleanCdnUrl}/${cleanPath}`;
}

/**
 * Get CDN URL for an image
 */
export function getCdnImageUrl(path: string): string {
  return getCdnUrl(path);
}

/**
 * Check if CDN is enabled
 */
export function isCdnEnabled(): boolean {
  return CDN_ENABLED && !!CDN_BASE_URL;
}
