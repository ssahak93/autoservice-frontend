'use client';

import { useCallback } from 'react';

import { useRouter, usePathname } from '@/i18n/routing';

import { useAuth } from './useAuth';

/**
 * Hook for email verification logic
 * Single Responsibility: Handles email verification checks and redirects
 *
 * @returns Object with email verification state and handlers
 */
export function useEmailVerification() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Check if email verification is required
   */
  const isEmailVerificationRequired = isAuthenticated && user && !user.emailVerified;

  /**
   * Check if current path is a verification-related page
   */
  const isVerificationPage =
    pathname?.includes('/auth/verify-email-required') || pathname?.includes('/auth/verify-email');

  /**
   * Redirect to email verification page
   * Saves current URL for redirect after verification
   */
  const redirectToVerification = useCallback(() => {
    if (typeof window !== 'undefined') {
      const currentPath = pathname + window.location.search;
      sessionStorage.setItem('redirectAfterVerification', currentPath);
    }
    router.push('/auth/verify-email-required');
  }, [pathname, router]);

  /**
   * Check if user can access protected content
   * Returns true if:
   * - User is not authenticated (will be handled by auth guard)
   * - User is authenticated and email is verified
   * - User is on verification page
   */
  const canAccess = !isEmailVerificationRequired || isVerificationPage;

  return {
    isEmailVerificationRequired,
    isVerificationPage,
    canAccess,
    redirectToVerification,
    isLoading,
    user,
    isAuthenticated,
  };
}
