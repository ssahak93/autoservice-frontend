'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { Link } from '@/i18n/routing';

const loginSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const t = useTranslations('auth');
  const { login, isLoggingIn } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-primary px-4">
      <div className="glass-light w-full max-w-md rounded-2xl p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-neutral-900">{t('login')}</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Welcome back! Please login to your account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label={t('email')}
            type="email"
            placeholder="your@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label={t('password')}
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="rounded" />
              <span>{t('rememberMe')}</span>
            </label>
            <Link href="/forgot-password" className="text-sm text-primary-600 hover:underline">
              {t('forgotPassword')}
            </Link>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoggingIn}>
            {t('login')}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-neutral-600">{t('noAccount')} </span>
          <Link href="/register" className="font-medium text-primary-600 hover:underline">
            {t('signUp')}
          </Link>
        </div>
      </div>
    </div>
  );
}
