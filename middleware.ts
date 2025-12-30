import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware({
  ...routing,
  // Detect locale from Accept-Language header or default to Armenian
  localeDetection: true,
  localePrefix: 'always',
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(hy|ru|en)/:path*'],
};
