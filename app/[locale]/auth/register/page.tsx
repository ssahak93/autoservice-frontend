'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { useAuth } from '@/hooks/useAuth';
import { Link } from '@/i18n/routing';
import { formatPhoneForBackend } from '@/lib/utils/phone.util';
import { commonValidations, createPasswordConfirmationRefinement } from '@/lib/utils/validation';
import type { RegisterRequest } from '@/types';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const { register: registerUser, isRegistering, isAuthenticated } = useAuth();

  const registerSchema = createPasswordConfirmationRefinement(
    'password',
    'confirmPassword',
    t('passwordsDontMatch', { defaultValue: "Passwords don't match" })
  )(
    z.object({
      email: commonValidations.email(
        t('emailRequired'),
        t('invalidEmail', { defaultValue: 'Invalid email address' })
      ),
      password: commonValidations.password(
        t('passwordMinLength'),
        t('passwordInvalid', {
          defaultValue:
            'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)',
        })
      ),
      confirmPassword: commonValidations.requiredString(
        t('confirmPasswordRequired', { defaultValue: 'Please confirm your password' })
      ),
      firstName: commonValidations.firstName(
        t('firstNameRequired', { defaultValue: 'First name is required' })
      ),
      lastName: commonValidations.lastName(
        t('lastNameRequired', { defaultValue: 'Last name is required' })
      ),
      phoneNumber: commonValidations.phoneOptional(
        t('invalidPhoneNumber', {
          defaultValue:
            'Phone number must be 8 digits (e.g., 98222680) or 9 digits starting with 0 (e.g., 098222680)',
        })
      ),
    })
  );

  type RegisterFormData = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  // Note: Redirect after successful registration is handled in useAuth hook's onSuccess callback
  // We don't need useEffect here to avoid conflicts and multiple redirects

  const onSubmit = (data: RegisterFormData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registerData } = data;
    // Format phone number for backend (add +374 prefix)
    if (registerData.phoneNumber) {
      registerData.phoneNumber = formatPhoneForBackend(registerData.phoneNumber);
    }
    registerUser(registerData as RegisterRequest);
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
              error={errors.firstName?.message as string | undefined}
              disabled={isRegistering || isSubmitting}
              autoComplete="given-name"
              {...register('firstName')}
            />
            <Input
              label={t('lastName')}
              placeholder="Doe"
              error={errors.lastName?.message as string | undefined}
              disabled={isRegistering || isSubmitting}
              autoComplete="family-name"
              {...register('lastName')}
            />
          </div>

          <Input
            label={t('email')}
            type="email"
            placeholder="your@email.com"
            error={errors.email?.message as string | undefined}
            disabled={isRegistering || isSubmitting}
            autoComplete="email"
            {...register('email')}
          />

          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <PhoneInput
                label={t('phoneNumber')}
                value={field.value || ''}
                onChange={field.onChange}
                error={errors.phoneNumber?.message as string | undefined}
                disabled={isRegistering || isSubmitting}
                helperText={t('phoneNumberHelper', {
                  defaultValue: 'Optional. Enter 8 or 9 digits (e.g., 98222680 or 098222680)',
                })}
              />
            )}
          />

          <PasswordInput
            label={t('password')}
            placeholder="••••••••"
            error={errors.password?.message as string | undefined}
            disabled={isRegistering || isSubmitting}
            autoComplete="new-password"
            helperText={t('passwordHelper', { defaultValue: 'At least 8 characters' })}
            {...register('password')}
          />

          <PasswordInput
            label={t('confirmPassword', { defaultValue: 'Confirm Password' })}
            placeholder="••••••••"
            error={errors.confirmPassword?.message as string | undefined}
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
            href="/auth/login"
            className="font-medium text-primary-600 transition-colors hover:text-primary-700 hover:underline"
          >
            {t('signIn')}
          </Link>
        </div>
      </div>
    </div>
  );
}
