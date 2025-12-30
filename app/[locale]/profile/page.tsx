'use client';

import { User } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
    },
  });

  const onSubmit = (data: unknown) => {
    // TODO: Implement profile update
    // Update profile logic will be implemented
    void data;
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-neutral-900">{t('title')}</h1>
          <p className="mt-2 text-neutral-600">{t('personalInfo')}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="glass-light rounded-xl p-6 text-center">
              <div className="relative mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full">
                {user.avatarFile?.fileUrl ? (
                  <Image
                    src={user.avatarFile.fileUrl}
                    alt={`${user.firstName} ${user.lastName}`}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-400 to-secondary-400">
                    <User className="h-16 w-16 text-white" />
                  </div>
                )}
              </div>

              <h2 className="font-display text-xl font-semibold">
                {user.firstName} {user.lastName}
              </h2>
              <p className="mt-1 text-sm text-neutral-600">{user.email}</p>

              <Button variant="outline" className="mt-4 w-full" size="sm">
                {t('uploadPhoto')}
              </Button>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="glass-light rounded-xl p-6">
              <h3 className="mb-6 font-display text-2xl font-semibold">{t('personalInfo')}</h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={t('firstName')}
                    {...register('firstName', { required: 'First name is required' })}
                    error={errors.firstName?.message}
                  />
                  <Input
                    label={t('lastName')}
                    {...register('lastName', { required: 'Last name is required' })}
                    error={errors.lastName?.message}
                  />
                </div>

                <Input
                  label={t('email')}
                  type="email"
                  disabled
                  {...register('email')}
                />

                <Input
                  label={t('phoneNumber')}
                  type="tel"
                  {...register('phoneNumber')}
                  error={errors.phoneNumber?.message}
                />

                <div className="flex gap-3">
                  <Button type="submit">{t('saveChanges')}</Button>
                  <Button type="button" variant="outline">
                    {t('changePassword')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

