'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useAuth } from '@/hooks/useAuth';
import { Link, useRouter } from '@/i18n/routing';

export default function LoginPage() {
  const t = useTranslations('auth');
  const { login, isLoggingIn, isAuthenticated } = useAuth();
  const router = useRouter();

  const loginSchema = z.object({
    email: z
      .string()
      .min(1, t('emailRequired'))
      .email(t('invalidEmail', { defaultValue: 'Invalid email address' })),
    password: z.string().min(8, t('passwordMinLength')),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Check if there's a saved redirect URL
      const redirectUrl =
        typeof window !== 'undefined' ? sessionStorage.getItem('redirectAfterLogin') : null;

      if (redirectUrl) {
        // Remove the saved URL and redirect there
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirectUrl);
      } else {
        // Default redirect to services
        router.push('/services');
      }
    }
  }, [isAuthenticated, router]);

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  // Don't render form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-primary px-4 py-12">
      <div className="glass-light w-full max-w-md rounded-2xl p-6 shadow-2xl sm:p-8">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-neutral-900 sm:text-4xl">
            {t('login')}
          </h1>
          <p className="mt-2 text-sm text-neutral-600 sm:text-base">
            {t('welcomeBack', { defaultValue: 'Welcome back! Please login to your account.' })}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6" noValidate>
          <Input
            label={t('email')}
            type="email"
            placeholder="your@email.com"
            error={errors.email?.message}
            disabled={isLoggingIn || isSubmitting}
            autoComplete="email"
            {...register('email')}
          />

          <PasswordInput
            label={t('password')}
            placeholder="••••••••"
            error={errors.password?.message}
            disabled={isLoggingIn || isSubmitting}
            autoComplete="current-password"
            {...register('password')}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                disabled={isLoggingIn || isSubmitting}
              />
              <span className="text-neutral-700">{t('rememberMe')}</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 hover:underline"
            >
              {t('forgotPassword')}
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoggingIn || isSubmitting}
            disabled={isLoggingIn || isSubmitting}
          >
            {t('login')}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-neutral-600">{t('noAccount')} </span>
          <Link
            href="/register"
            className="font-medium text-primary-600 transition-colors hover:text-primary-700 hover:underline"
          >
            {t('signUp')}
          </Link>
        </div>
      </div>
    </div>
  );
}
