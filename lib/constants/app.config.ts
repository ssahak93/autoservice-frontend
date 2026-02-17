/**
 * Application configuration constants
 *
 * These constants are loaded from environment variables with fallback defaults.
 * All environment variables should be prefixed with NEXT_PUBLIC_ to be accessible in the browser.
 */

/**
 * Brand name (full name of the application)
 * Default: Auto Service Connect
 */
export const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || 'Auto Service Connect';

/**
 * Short brand name (for PWA manifest, etc.)
 * Default: AutoService
 */
export const BRAND_NAME_SHORT = process.env.NEXT_PUBLIC_BRAND_NAME_SHORT || 'AutoService';

/**
 * Domain name (without protocol, e.g., "autoserviceconnect.am")
 * Default: autoserviceconnect.am
 */
export const DOMAIN_NAME = process.env.NEXT_PUBLIC_DOMAIN_NAME || 'autoserviceconnect.am';

/**
 * Site URL (full URL with protocol)
 * Default: https://autoserviceconnect.am
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME || 'autoserviceconnect.am'}`;

/**
 * Twitter handle (without @, e.g., "autoserviceconnect")
 * Default: autoserviceconnect
 */
export const TWITTER_HANDLE = process.env.NEXT_PUBLIC_TWITTER_HANDLE || 'autoserviceconnect';

/**
 * User-Agent string for external API calls (e.g., geocoding)
 * Default: AutoServiceConnect/1.0
 */
export const USER_AGENT = process.env.NEXT_PUBLIC_USER_AGENT || 'AutoServiceConnect/1.0';

/**
 * Support email address for contact and customer support
 * Default: support@autoserviceconnect.com
 */
export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ||
  `support@${process.env.NEXT_PUBLIC_DOMAIN_NAME || 'autoserviceconnect.com'}`;

/**
 * Application name (alias for BRAND_NAME for backward compatibility)
 * Default: Auto Service Connect
 */
export const APP_NAME = BRAND_NAME;

/**
 * Application URL (alias for SITE_URL for backward compatibility)
 * Default: https://autoserviceconnect.am
 */
export const APP_URL = SITE_URL;
