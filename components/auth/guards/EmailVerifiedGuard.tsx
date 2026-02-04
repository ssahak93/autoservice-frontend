'use client';

import { useEffect, useState } from 'react';

import { useEmailVerification } from '@/hooks/useEmailVerification';

interface EmailVerifiedGuardProps {
  children: React.ReactNode;
  /**
   * If true, redirects to verification page when email is not verified
   * @default true
   */
  redirect?: boolean;
  /**
   * Custom fallback component to show when email is not verified
   * If not provided, will redirect or show nothing
   */
  fallback?: React.ReactNode;
}

/**
 * EmailVerifiedGuard Component
 *
 * Single Responsibility: Protects content that requires verified email
 * Open/Closed: Can be extended with custom fallback without modification
 *
 * Usage:
 * ```tsx
 * <EmailVerifiedGuard>
 *   <ProtectedContent />
 * </EmailVerifiedGuard>
 * ```
 */
export function EmailVerifiedGuard({
  children,
  redirect = true,
  fallback,
}: EmailVerifiedGuardProps) {
  const { isEmailVerificationRequired, isVerificationPage, redirectToVerification, isLoading } =
    useEmailVerification();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && redirect && !isLoading && isEmailVerificationRequired && !isVerificationPage) {
      redirectToVerification();
    }
  }, [
    mounted,
    redirect,
    isLoading,
    isEmailVerificationRequired,
    isVerificationPage,
    redirectToVerification,
  ]);

  // Show loading during check
  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  // If email verification is required and not on verification page
  if (isEmailVerificationRequired && !isVerificationPage) {
    // Show fallback if provided, otherwise show loading (will redirect)
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
