'use client';

import { useEffect } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from '@/i18n/routing';

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

  useEffect(() => {
    if (redirect && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, redirect]);

  if (isLoading && redirect) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
