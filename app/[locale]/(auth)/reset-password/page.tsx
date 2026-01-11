'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Link, useRouter } from '@/i18n/routing';
import { authService } from '@/lib/services/auth.service';
import { PASSWORD_PATTERN, PASSWORD_ERROR_MESSAGE } from '@/lib/utils/password.util';
import { useUIStore } from '@/stores/uiStore';

export default function ResetPasswordPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useUIStore();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      showToast(
        t('invalidResetToken', { defaultValue: 'Invalid or missing reset token' }),
        'error'
      );
      router.push('/forgot-password');
      return;
    }
    setToken(tokenParam);
  }, [searchParams, router, showToast, t]);

  const resetPasswordSchema = z
    .object({
      newPassword: z.string().min(8, t('passwordMinLength')).regex(PASSWORD_PATTERN, {
        message: PASSWORD_ERROR_MESSAGE,
      }),
      confirmPassword: z.string().min(1, t('confirmPasswordRequired')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('passwordsDontMatch'),
      path: ['confirmPassword'],
    });

  type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      showToast(
        t('invalidResetToken', { defaultValue: 'Invalid or missing reset token' }),
        'error'
      );
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({
        token,
        newPassword: data.newPassword,
      });
      setIsSuccess(true);
      showToast(
        t('resetPasswordSuccess', { defaultValue: 'Password reset successfully' }),
        'success'
      );
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('resetPasswordError', { defaultValue: 'Failed to reset password' });
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-primary px-4 py-12">
        <div className="glass-light w-full max-w-md rounded-2xl p-6 shadow-2xl sm:p-8">
          <div className="text-center">
            <p className="text-neutral-600">{t('loading', { defaultValue: 'Loading...' })}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-primary px-4 py-12">
        <div className="glass-light w-full max-w-md rounded-2xl p-6 shadow-2xl sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-100">
              <CheckCircle className="h-8 w-8 text-success-600" />
            </div>
            <h1 className="font-display text-3xl font-bold text-neutral-900 sm:text-4xl">
              {t('passwordResetSuccess', { defaultValue: 'Password Reset Successful' })}
            </h1>
            <p className="mt-2 text-sm text-neutral-600 sm:text-base">
              {t('passwordResetSuccessDescription', {
                defaultValue: 'Your password has been reset successfully. Redirecting to login...',
              })}
            </p>
          </div>

          <Button type="button" className="w-full" onClick={() => router.push('/login')}>
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
          <h1 className="font-display text-3xl font-bold text-neutral-900 sm:text-4xl">
            {t('resetPassword', { defaultValue: 'Reset Password' })}
          </h1>
          <p className="mt-2 text-sm text-neutral-600 sm:text-base">
            {t('resetPasswordDescription', {
              defaultValue: 'Enter your new password below.',
            })}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6" noValidate>
          <PasswordInput
            label={t('newPassword', { defaultValue: 'New Password' })}
            placeholder="••••••••"
            error={errors.newPassword?.message}
            disabled={isLoading || isSubmitting}
            autoComplete="new-password"
            {...register('newPassword')}
          />

          <PasswordInput
            label={t('confirmPassword')}
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            disabled={isLoading || isSubmitting}
            autoComplete="new-password"
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading || isSubmitting}
            disabled={isLoading || isSubmitting}
          >
            {t('resetPassword', { defaultValue: 'Reset Password' })}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToLogin', { defaultValue: 'Back to Login' })}
          </Link>
        </div>
      </div>
    </div>
  );
}
