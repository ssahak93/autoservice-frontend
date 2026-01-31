import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['hy', 'en', 'ru'], // Armenian first as default

  // Used when no locale matches - Armenian is now default
  defaultLocale: 'hy',

  // Locale prefix strategy
  localePrefix: 'always', // Always show locale prefix in URL
});

// Extract locale type from routing configuration
export type Locale = (typeof routing.locales)[number];

// Export locales and defaultLocale for convenience
export const locales = routing.locales;
export const defaultLocale = routing.defaultLocale;

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
