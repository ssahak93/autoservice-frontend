'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Link, useRouter } from '@/i18n/routing';
import { authService } from '@/lib/services/auth.service';
import { useUIStore } from '@/stores/uiStore';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { showToast } = useUIStore();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const forgotPasswordSchema = z.object({
    email: z
      .string()
      .min(1, t('emailRequired'))
      .email(t('invalidEmail', { defaultValue: 'Invalid email address' })),
  });

  type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword({ email: data.email });
      setIsSubmitted(true);
      showToast(
        t('forgotPasswordSuccess', {
          defaultValue: 'If email exists, password reset link has been sent',
        }),
        'success'
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('forgotPasswordError', { defaultValue: 'Failed to send reset email' });
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-primary px-4 py-12">
        <div className="glass-light w-full max-w-md rounded-2xl p-6 shadow-2xl sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <Mail className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="font-display text-3xl font-bold text-neutral-900 sm:text-4xl">
              {t('checkEmail', { defaultValue: 'Check your email' })}
            </h1>
            <p className="mt-2 text-sm text-neutral-600 sm:text-base">
              {t('resetEmailSent', {
                defaultValue:
                  'If an account with that email exists, we have sent a password reset link.',
              })}
            </p>
          </div>

          <div className="space-y-4">
            <Button type="button" className="w-full" onClick={() => router.push('/login')}>
              {t('backToLogin', { defaultValue: 'Back to Login' })}
            </Button>
            <div className="text-center text-sm text-neutral-600">
              {t('didntReceiveEmail', { defaultValue: "Didn't receive the email?" })}{' '}
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="font-medium text-primary-600 transition-colors hover:text-primary-700 hover:underline"
              >
                {t('tryAgain', { defaultValue: 'Try again' })}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-primary px-4 py-12">
      <div className="glass-light w-full max-w-md rounded-2xl p-6 shadow-2xl sm:p-8">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-neutral-900 sm:text-4xl">
            {t('forgotPasswordTitle', { defaultValue: 'Forgot Password' })}
          </h1>
          <p className="mt-2 text-sm text-neutral-600 sm:text-base">
            {t('forgotPasswordDescription', {
              defaultValue:
                "Enter your email address and we'll send you a link to reset your password.",
            })}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6" noValidate>
          <Input
            label={t('email')}
            type="email"
            placeholder="your@email.com"
            error={errors.email?.message}
            disabled={isLoading || isSubmitting}
            autoComplete="email"
            {...register('email')}
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading || isSubmitting}
            disabled={isLoading || isSubmitting}
          >
            {t('sendResetLink', { defaultValue: 'Send Reset Link' })}
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
