import { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware({
  ...routing,
  // Detect locale from Accept-Language header or default to Armenian
  localeDetection: true,
  localePrefix: 'always',
});

export function proxy(request: NextRequest) {
  return intlMiddleware(request);
}

// Match all pathnames except static files and API routes
export const config = {
  matcher: [
    // Match all pathnames except:
    // - api routes
    // - _next (Next.js internals)
    // - _vercel (Vercel internals)
    // - static files (images, etc.)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
