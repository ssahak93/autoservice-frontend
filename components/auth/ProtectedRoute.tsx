'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from '@/i18n/routing';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * If true, redirects to login when not authenticated (for full page protection)
   * If false, only hides the content (for UI element protection)
   * @default true
   */
  redirect?: boolean;
}

export function ProtectedRoute({ children, redirect = true }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only checking localStorage after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if token exists in localStorage (for page reloads before auth state loads)
  // Only check after mount to prevent hydration mismatch
  const hasToken =
    mounted && typeof window !== 'undefined' && !!localStorage.getItem('accessToken');
  const shouldShowContent = isAuthenticated || hasToken;

  useEffect(() => {
    // Only redirect if we're sure user is not authenticated (no token and not loading)
    // And only after mount to prevent hydration issues
    if (mounted && redirect && !isLoading && !isAuthenticated && !hasToken) {
      // Save current URL to redirect back after login (without locale prefix)
      if (typeof window !== 'undefined') {
        const currentPath = pathname + window.location.search;
        sessionStorage.setItem('redirectAfterLogin', currentPath);
      }
      router.push('/login');
    }
  }, [mounted, isAuthenticated, isLoading, router, redirect, hasToken, pathname]);

  // On server or before mount, always show loading to prevent hydration mismatch
  if (!mounted && redirect) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  // Show loading if we're checking authentication (has token but user not loaded yet)
  if ((isLoading || (hasToken && !isAuthenticated)) && redirect) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!shouldShowContent) {
    return null;
  }

  return <>{children}</>;
}
