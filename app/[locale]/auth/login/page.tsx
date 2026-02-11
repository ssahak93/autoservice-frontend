'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useAuth } from '@/hooks/useAuth';
import { Link } from '@/i18n/routing';
import { commonValidations } from '@/lib/utils/validation';

export default function LoginPage() {
  const t = useTranslations('auth');
  const { login, isLoggingIn, isAuthenticated } = useAuth();

  const loginSchema = z.object({
    email: commonValidations.email(
      t('emailRequired'),
      t('invalidEmail', { defaultValue: 'Invalid email address' })
    ),
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

  // Note: Redirect after successful login is handled in useAuth hook's onSuccess callback
  // We don't need useEffect here to avoid conflicts and multiple redirects

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

          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
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
            href="/auth/register"
            className="font-medium text-primary-600 transition-colors hover:text-primary-700 hover:underline"
          >
            {t('signUp')}
          </Link>
        </div>
      </div>
    </div>
  );
}
