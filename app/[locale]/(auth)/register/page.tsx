'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { Link, useRouter } from '@/i18n/routing';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const { register: registerUser, isRegistering, isAuthenticated } = useAuth();
  const router = useRouter();

  const registerSchema = z
    .object({
      email: z
        .string()
        .min(1, t('emailRequired'))
        .email(t('invalidEmail', { defaultValue: 'Invalid email address' })),
      password: z.string().min(8, t('passwordMinLength')),
      confirmPassword: z
        .string()
        .min(1, t('confirmPasswordRequired', { defaultValue: 'Please confirm your password' })),
      firstName: z
        .string()
        .min(1, t('firstNameRequired', { defaultValue: 'First name is required' })),
      lastName: z.string().min(1, t('lastNameRequired', { defaultValue: 'Last name is required' })),
      phoneNumber: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('passwordsDontMatch', { defaultValue: "Passwords don't match" }),
      path: ['confirmPassword'],
    });

  type RegisterFormData = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
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

  const onSubmit = (data: RegisterFormData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registerData } = data;
    registerUser(registerData);
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
            {t('register')}
          </h1>
          <p className="mt-2 text-sm text-neutral-600 sm:text-base">
            {t('createAccount', { defaultValue: 'Create your account to get started.' })}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={t('firstName')}
              placeholder="John"
              error={errors.firstName?.message}
              disabled={isRegistering || isSubmitting}
              autoComplete="given-name"
              {...register('firstName')}
            />
            <Input
              label={t('lastName')}
              placeholder="Doe"
              error={errors.lastName?.message}
              disabled={isRegistering || isSubmitting}
              autoComplete="family-name"
              {...register('lastName')}
            />
          </div>

          <Input
            label={t('email')}
            type="email"
            placeholder="your@email.com"
            error={errors.email?.message}
            disabled={isRegistering || isSubmitting}
            autoComplete="email"
            {...register('email')}
          />

          <Input
            label={t('phoneNumber')}
            type="tel"
            placeholder="+374 XX XXX XXX"
            error={errors.phoneNumber?.message}
            disabled={isRegistering || isSubmitting}
            autoComplete="tel"
            {...register('phoneNumber')}
          />

          <Input
            label={t('password')}
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            disabled={isRegistering || isSubmitting}
            autoComplete="new-password"
            helperText={t('passwordHelper', { defaultValue: 'At least 8 characters' })}
            {...register('password')}
          />

          <Input
            label={t('confirmPassword', { defaultValue: 'Confirm Password' })}
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            disabled={isRegistering || isSubmitting}
            autoComplete="new-password"
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={isRegistering || isSubmitting}
            disabled={isRegistering || isSubmitting}
          >
            {t('signUp')}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-neutral-600">{t('hasAccount')} </span>
          <Link
            href="/login"
            className="font-medium text-primary-600 transition-colors hover:text-primary-700 hover:underline"
          >
            {t('signIn')}
          </Link>
        </div>
      </div>
    </div>
  );
}
