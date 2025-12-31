import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';

export default createMiddleware({
  ...routing,
  // Detect locale from Accept-Language header or default to Armenian
  localeDetection: true,
  localePrefix: 'always',
});

export const config = {
  // Match all pathnames except static files and API routes
  matcher: [
    // Match all pathnames except:
    // - api routes
    // - _next (Next.js internals)
    // - _vercel (Vercel internals)
    // - static files (images, etc.)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
