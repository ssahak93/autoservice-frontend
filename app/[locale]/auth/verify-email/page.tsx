'use client';

import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Link, useRouter } from '@/i18n/routing';
import { authService } from '@/lib/services/auth.service';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

export default function VerifyEmailPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useUIStore();
  const { setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setStatus('error');
      setErrorMessage(
        t('invalidVerificationToken', { defaultValue: 'Invalid or missing verification token' })
      );
      return;
    }
    setToken(tokenParam);
  }, [searchParams, t]);

  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        const response = await authService.verifyEmail(token);
        if (response.success) {
          setStatus('success');
          showToast(
            t('emailVerifiedSuccess', { defaultValue: 'Email verified successfully!' }),
            'success'
          );
          // Update user in store if logged in and invalidate React Query cache
          try {
            // Invalidate auth query to force refetch
            await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

            // Try to get updated user data
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
              setUser(currentUser);
            }

            // If user is authenticated, redirect to services or saved URL
            // Otherwise redirect to login
            setTimeout(() => {
              const redirectUrl =
                typeof window !== 'undefined'
                  ? sessionStorage.getItem('redirectAfterVerification')
                  : null;

              if (redirectUrl) {
                sessionStorage.removeItem('redirectAfterVerification');
                router.push(redirectUrl);
              } else if (currentUser) {
                // User is logged in, redirect to services
                router.push('/services');
              } else {
                // User is not logged in, redirect to login
                router.push('/auth/login');
              }
            }, 2000);
          } catch {
            // If user is not logged in, that's fine - they'll login after redirect
            setTimeout(() => {
              const redirectUrl =
                typeof window !== 'undefined'
                  ? sessionStorage.getItem('redirectAfterVerification')
                  : null;
              if (redirectUrl) {
                sessionStorage.removeItem('redirectAfterVerification');
                router.push(redirectUrl);
              } else {
                router.push('/auth/login');
              }
            }, 2000);
          }
        } else {
          setStatus('error');
          setErrorMessage(
            response.message ||
              t('verificationFailed', { defaultValue: 'Email verification failed' })
          );
        }
      } catch (error) {
        setStatus('error');
        const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
        const message =
          errorObj?.response?.data?.message ||
          errorObj?.message ||
          t('verificationError', {
            defaultValue: 'Failed to verify email. The token may be invalid or expired.',
          });
        setErrorMessage(message);
        showToast(message, 'error');
      }
    };

    verifyEmail();
  }, [token, router, showToast, t, queryClient, setUser]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-primary px-4 py-12">
        <div className="glass-light w-full max-w-md rounded-2xl p-6 shadow-2xl sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
            <h1 className="font-display text-3xl font-bold text-neutral-900 sm:text-4xl">
              {t('verifyingEmail', { defaultValue: 'Verifying Email' })}
            </h1>
            <p className="mt-2 text-sm text-neutral-600 sm:text-base">
              {t('verifyingEmailDescription', {
                defaultValue: 'Please wait while we verify your email address...',
              })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-primary px-4 py-12">
        <div className="glass-light w-full max-w-md rounded-2xl p-6 shadow-2xl sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-100">
              <CheckCircle className="h-8 w-8 text-success-600" />
            </div>
            <h1 className="font-display text-3xl font-bold text-neutral-900 sm:text-4xl">
              {t('emailVerified', { defaultValue: 'Email Verified' })}
            </h1>
            <p className="mt-2 text-sm text-neutral-600 sm:text-base">
              {t('emailVerifiedDescription', {
                defaultValue: 'Your email has been verified successfully. Redirecting to login...',
              })}
            </p>
          </div>

          <Button type="button" className="w-full" onClick={() => router.push('/auth/login')}>
            {t('backToLogin', { defaultValue: 'Back to Login' })}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-primary px-4 py-12">
      <div className="glass-light w-full max-w-md rounded-2xl p-6 shadow-2xl sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error-100">
            <XCircle className="h-8 w-8 text-error-600" />
          </div>
          <h1 className="font-display text-3xl font-bold text-neutral-900 sm:text-4xl">
            {t('verificationFailed', { defaultValue: 'Verification Failed' })}
          </h1>
          <p className="mt-2 text-sm text-neutral-600 sm:text-base">
            {errorMessage ||
              t('verificationFailedDescription', {
                defaultValue: 'The verification link is invalid or has expired.',
              })}
          </p>
        </div>

        <div className="space-y-4">
          <Button type="button" className="w-full" onClick={() => router.push('/auth/login')}>
            {t('backToLogin', { defaultValue: 'Back to Login' })}
          </Button>

          <div className="text-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('backToRegister', { defaultValue: 'Back to Registration' })}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
