import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';

// Protected routes that require authentication
const protectedRoutes = ['/visits', '/dashboard', '/profile', '/notifications', '/my-service'];

// Public routes that don't require authentication
const publicRoutes = [
  '/auth',
  '/services',
  '/invite', // Can be accessed without auth for accepting invitations
];

// Routes that require authentication but allow unverified email

const _unverifiedEmailRoutes = [
  '/auth/verify-email-required', // Allow access to verification required page
];

const intlMiddleware = createIntlMiddleware(routing);

export default function middleware(request: NextRequest) {
  // First, apply internationalization middleware
  const response = intlMiddleware(request);

  // Get the pathname without locale prefix
  const pathname = request.nextUrl.pathname;
  const locale = pathname.split('/')[1];
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathWithoutLocale.startsWith(route));

  // Check if the route is public (explicitly allowed)
  const isPublicRoute =
    publicRoutes.some((route) => pathWithoutLocale.startsWith(route)) || pathWithoutLocale === '/';

  // If it's a protected route, check for authentication
  if (isProtectedRoute && !isPublicRoute) {
    // Check for access token in cookies
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      // No token found, redirect to login
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      // Save the current URL for redirect after login
      loginUrl.searchParams.set('redirect', pathWithoutLocale);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Note: We don't redirect authenticated users away from auth pages in middleware
  // Let the auth pages themselves handle this logic (they can validate token validity)
  // This allows users to access login page even with potentially expired/invalid tokens

  return response;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
