'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from '@/i18n/routing';

interface AuthGuardProps {
  children: React.ReactNode;
  /**
   * If true, redirects to login when not authenticated
   * @default true
   */
  redirect?: boolean;
  /**
   * Custom fallback component to show when not authenticated
   * If not provided, will redirect or show nothing
   */
  fallback?: React.ReactNode;
}

/**
 * AuthGuard Component
 *
 * Single Responsibility: Protects content that requires authentication
 * Open/Closed: Can be extended with custom fallback without modification
 *
 * Usage:
 * ```tsx
 * <AuthGuard>
 *   <ProtectedContent />
 * </AuthGuard>
 * ```
 */
export function AuthGuard({ children, redirect = true, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if token exists in localStorage (for page reloads before auth state loads)
  const hasToken =
    mounted && typeof window !== 'undefined' && !!localStorage.getItem('accessToken');

  useEffect(() => {
    if (mounted && redirect && !isLoading && !isAuthenticated && !hasToken) {
      // Save current URL to redirect back after login
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname + window.location.search;
        sessionStorage.setItem('redirectAfterLogin', currentPath);
      }
      router.push('/auth/login');
    }
  }, [mounted, redirect, isLoading, isAuthenticated, hasToken, router]);

  // Show loading during check
  if (!mounted || isLoading || (hasToken && !isAuthenticated)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  // If not authenticated and redirect is enabled, show loading (will redirect)
  if (!isAuthenticated && !hasToken && redirect) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  // If not authenticated and redirect is disabled, show fallback or nothing
  if (!isAuthenticated && !hasToken) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
