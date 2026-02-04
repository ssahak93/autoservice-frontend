'use client';

import { AuthGuard, EmailVerifiedGuard } from './guards';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * If true, redirects to login when not authenticated (for full page protection)
   * If false, only hides the content (for UI element protection)
   * @default true
   */
  redirect?: boolean;
  /**
   * If true, checks email verification and redirects to verification page if not verified
   * @default true
   */
  requireEmailVerification?: boolean;
}

/**
 * ProtectedRoute Component
 *
 * Composite guard that combines AuthGuard and EmailVerifiedGuard
 * Single Responsibility: Composes authentication and email verification guards
 * Open/Closed: Can be extended by adding more guards without modification
 *
 * Usage:
 * ```tsx
 * <ProtectedRoute>
 *   <ProtectedContent />
 * </ProtectedRoute>
 *
 * // Without email verification
 * <ProtectedRoute requireEmailVerification={false}>
 *   <Content />
 * </ProtectedRoute>
 *
 * // Without redirect (for UI elements)
 * <ProtectedRoute redirect={false}>
 *   <Button />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  redirect = true,
  requireEmailVerification = true,
}: ProtectedRouteProps) {
  // Compose guards: first check auth, then email verification
  return (
    <AuthGuard redirect={redirect} fallback={redirect ? undefined : null}>
      {requireEmailVerification ? (
        <EmailVerifiedGuard redirect={redirect} fallback={redirect ? undefined : null}>
          {children}
        </EmailVerifiedGuard>
      ) : (
        children
      )}
    </AuthGuard>
  );
}
