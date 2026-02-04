'use client';

import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { Link, useRouter } from '@/i18n/routing';
import { authService } from '@/lib/services/auth.service';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

export default function VerifyEmailRequiredPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { setUser } = useAuthStore();
  const { showToast } = useUIStore();
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if email is already verified and redirect if so
  useEffect(() => {
    const checkEmailVerification = async () => {
      // Wait for user to load
      if (isLoading) {
        return;
      }

      // If user is not authenticated, redirect to login
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // If email is already verified, redirect to services or saved redirect URL
      if (user.emailVerified) {
        const redirectUrl =
          typeof window !== 'undefined'
            ? sessionStorage.getItem('redirectAfterVerification')
            : null;
        if (redirectUrl) {
          sessionStorage.removeItem('redirectAfterVerification');
          router.push(redirectUrl);
        } else {
          router.push('/services');
        }
        return;
      }

      // Email is not verified, allow access to this page
      setIsChecking(false);
    };

    checkEmailVerification();
  }, [user, isLoading, router]);

  const handleResendVerification = async () => {
    if (!user?.email) {
      showToast(t('emailNotFound', { defaultValue: 'Email not found' }), 'error');
      return;
    }

    setIsResending(true);
    try {
      await authService.resendVerificationEmail(user.email, locale);
      showToast(
        t('verificationEmailSent', {
          defaultValue: 'Verification email sent. Please check your inbox.',
        }),
        'success'
      );
    } catch (error) {
      const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
      const message =
        errorObj?.response?.data?.message ||
        errorObj?.message ||
        t('resendVerificationFailed', {
          defaultValue: 'Failed to resend verification email. Please try again later.',
        });
      showToast(message, 'error');
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    // Refresh user data to check if email is now verified
    try {
      const updatedUser = await authService.getCurrentUser();
      // Update user in store
      setUser(updatedUser);
      if (updatedUser.emailVerified) {
        showToast(
          t('emailVerifiedSuccess', { defaultValue: 'Email verified successfully!' }),
          'success'
        );
        // Redirect to saved URL or default to services
        const redirectUrl =
          typeof window !== 'undefined'
            ? sessionStorage.getItem('redirectAfterVerification')
            : null;
        if (redirectUrl) {
          sessionStorage.removeItem('redirectAfterVerification');
          router.push(redirectUrl);
        } else {
          router.push('/services');
        }
      } else {
        showToast(
          t('emailNotVerifiedYet', {
            defaultValue:
              'Email not verified yet. Please check your inbox and click the verification link.',
          }),
          'info'
        );
      }
    } catch {
      showToast(
        t('checkVerificationFailed', {
          defaultValue: 'Failed to check verification status. Please try again.',
        }),
        'error'
      );
    }
  };

  // Show loading while checking verification status
  if (isChecking || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-primary px-4 py-12">
        <div className="glass-light w-full max-w-md rounded-2xl p-6 shadow-2xl sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
            <h1 className="font-display text-3xl font-bold text-neutral-900 sm:text-4xl">
              {t('checking', { defaultValue: 'Checking...' })}
            </h1>
          </div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, don't render (will redirect)
  if (!user) {
    return null;
  }

  // If email is already verified, don't render (will redirect)
  if (user.emailVerified) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-primary px-4 py-12">
      <div className="glass-light w-full max-w-md rounded-2xl p-6 shadow-2xl sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning-100">
            <Mail className="h-8 w-8 text-warning-600" />
          </div>
          <h1 className="font-display text-3xl font-bold text-neutral-900 sm:text-4xl">
            {t('emailVerificationRequired', { defaultValue: 'Email Verification Required' })}
          </h1>
          <p className="mt-2 text-sm text-neutral-600 sm:text-base">
            {t('emailVerificationRequiredDescription', {
              defaultValue:
                'Please verify your email address to access this page. We sent a verification link to your email.',
            })}
          </p>
          {user?.email && <p className="mt-2 text-sm font-medium text-primary-600">{user.email}</p>}
        </div>

        <div className="space-y-4">
          <Button
            type="button"
            className="w-full"
            onClick={handleResendVerification}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('sending', { defaultValue: 'Sending...' })}
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                {t('resendVerificationEmail', { defaultValue: 'Resend Verification Email' })}
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleCheckVerification}
          >
            {t('checkVerification', { defaultValue: 'I have verified my email' })}
          </Button>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('backToLogin', { defaultValue: 'Back to Login' })}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
