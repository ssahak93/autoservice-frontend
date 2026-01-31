'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useCreateAutoService } from '@/hooks/useAutoServiceMutations';
import { useAutoServiceValidation } from '@/hooks/useAutoServiceValidation';
import { Link, useRouter } from '@/i18n/routing';
import { FILE_CATEGORIES } from '@/lib/constants/file-categories.constants';
import { MAX_AUTO_SERVICES_PER_USER } from '@/lib/services/auto-services.service';
import { type UploadedFile } from '@/lib/services/files.service';
import { useAuthStore } from '@/stores/authStore';
import { useAutoServiceStore } from '@/stores/autoServiceStore';

import { ServiceAvatar } from './ServiceAvatar';

export function CreateAutoService() {
  const t = useTranslations('myService.create');
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuth();
  const { setUser } = useAuthStore();
  const { availableAutoServices, setSelectedAutoServiceId } = useAutoServiceStore();
  const [serviceType, setServiceType] = useState<'individual' | 'company'>('individual');
  const [mounted, setMounted] = useState(false);
  const [avatarFile, setAvatarFile] = useState<UploadedFile | null>(null);
  const [avatarFileId, setAvatarFileId] = useState<string | undefined>(undefined);

  // Track mounted state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user has reached the maximum number of auto services
  // Use user.autoServices if available, otherwise fallback to availableAutoServices
  // Only calculate after mount to prevent hydration mismatch
  // Memoize owned services count calculation
  const ownedServicesCount = useMemo(
    () =>
      mounted
        ? user?.autoServices?.length ||
          availableAutoServices.filter((s) => s.role === 'owner').length
        : 0,
    [mounted, user?.autoServices, availableAutoServices]
  );
  const canCreateMore = ownedServicesCount < MAX_AUTO_SERVICES_PER_USER;

  // Use custom hook for validation (SOLID - Single Responsibility)
  const { schema } = useAutoServiceValidation();

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      serviceType: 'individual',
    },
  });

  const watchedServiceType = watch('serviceType');

  // Use custom hook for create mutation (SOLID - Single Responsibility)
  const createMutation = useCreateAutoService();

  const onSubmit = (data: FormData) => {
    const payload: {
      serviceType: 'individual' | 'company';
      companyName?: string;
      firstName?: string;
      lastName?: string;
      avatarFileId?: string;
    } = {
      serviceType: data.serviceType,
    };

    if (data.serviceType === 'company') {
      payload.companyName = data.companyName?.trim();
    } else {
      payload.firstName = data.firstName?.trim();
      payload.lastName = data.lastName?.trim();
    }

    if (avatarFileId) {
      payload.avatarFileId = avatarFileId;
    }

    createMutation.mutate(payload, {
      onSuccess: async (newService) => {
        // Select the newly created service immediately
        if (newService?.id) {
          setSelectedAutoServiceId(newService.id);
        }

        // Invalidate and refetch all related queries
        await Promise.all([
          queryClient.refetchQueries({ queryKey: ['auth', 'me'] }),
          queryClient.refetchQueries({ queryKey: ['availableAutoServices'] }),
          queryClient.invalidateQueries({ queryKey: ['autoServiceProfile'] }),
        ]);

        // Update user data in Zustand store after refetch
        const updatedUser = queryClient.getQueryData(['auth', 'me']);
        if (updatedUser) {
          setUser(updatedUser as typeof user);
        }

        // Immediately redirect to my-service page
        router.push('/my-service');
      },
    });
  };

  // Don't render max reached message until mounted to prevent hydration mismatch
  if (mounted && !canCreateMore) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="glass-light rounded-xl p-6 text-center" suppressHydrationWarning>
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              {t('maxReached.title', {
                defaultValue: 'Maximum Auto Services Reached',
              })}
            </h1>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              {t('maxReached.message', {
                defaultValue: `You have reached the maximum limit of ${MAX_AUTO_SERVICES_PER_USER} auto services.`,
                count: MAX_AUTO_SERVICES_PER_USER,
              })}
            </p>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-500">
              {t('maxReached.hint', {
                defaultValue: 'Please delete an existing service to create a new one.',
              })}
            </p>
            {/* Show list of owned services */}
            {mounted && user?.autoServices && user.autoServices.length > 0 && (
              <div
                className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
                suppressHydrationWarning
              >
                <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  {t('maxReached.yourServices', {
                    defaultValue: 'Your Auto Services',
                  })}
                </h2>
                <div className="space-y-2">
                  {user.autoServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
                    >
                      <div className="flex items-center gap-3">
                        <ServiceAvatar
                          avatarFile={service.avatarFile}
                          name={
                            service.serviceType === 'company'
                              ? service.companyName || 'Service'
                              : `${service.firstName} ${service.lastName}`.trim() || 'Service'
                          }
                          isApproved={false}
                          size="sm"
                          variant="primary"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {service.serviceType === 'company'
                              ? service.companyName || 'My Service'
                              : `${service.firstName || ''} ${service.lastName || ''}`.trim() ||
                                'My Service'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {service.serviceType === 'company' ? 'Company' : 'Individual'}
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/my-service"
                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                      >
                        {t('maxReached.manage', { defaultValue: 'Manage' })}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('title', { defaultValue: 'Create Your Auto Service' })}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t('description', {
              defaultValue: 'Get started by creating your auto service profile',
            })}
          </p>
          {ownedServicesCount > 0 && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
              {t('servicesCount', {
                defaultValue: `You have ${ownedServicesCount} of ${MAX_AUTO_SERVICES_PER_USER} auto services`,
                count: ownedServicesCount,
                max: MAX_AUTO_SERVICES_PER_USER,
              })}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="glass-light space-y-6 rounded-xl p-6">
          {/* Service Type Selection */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('serviceType', { defaultValue: 'Service Type' })}
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setServiceType('individual');
                  setValue('serviceType', 'individual', { shouldValidate: true });
                }}
                className={`flex-1 rounded-lg border-2 p-4 text-left transition-colors ${
                  (watchedServiceType || serviceType) === 'individual'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${
                      (watchedServiceType || serviceType) === 'individual'
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-400'
                    }`}
                  >
                    {(watchedServiceType || serviceType) === 'individual' && (
                      <div
                        className="h-full w-full rounded-full bg-white"
                        style={{ transform: 'scale(0.4)' }}
                      />
                    )}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {t('individual', { defaultValue: 'Individual' })}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {t('individualDescription', { defaultValue: 'Personal auto service' })}
                </p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setServiceType('company');
                  setValue('serviceType', 'company', { shouldValidate: true });
                }}
                className={`flex-1 rounded-lg border-2 p-4 text-left transition-colors ${
                  (watchedServiceType || serviceType) === 'company'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${
                      (watchedServiceType || serviceType) === 'company'
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-400'
                    }`}
                  >
                    {(watchedServiceType || serviceType) === 'company' && (
                      <div
                        className="h-full w-full rounded-full bg-white"
                        style={{ transform: 'scale(0.4)' }}
                      />
                    )}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {t('company', { defaultValue: 'Company' })}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {t('companyDescription', { defaultValue: 'Business auto service' })}
                </p>
              </button>
            </div>
            {errors.serviceType && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.serviceType.message}
              </p>
            )}
          </div>

          {/* Avatar Upload */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('avatar', { defaultValue: 'Avatar' })}
            </label>
            <FileUpload
              accept="image/*"
              maxSize={10}
              maxFiles={1}
              multiple={false}
              label={t('uploadAvatar', { defaultValue: 'Upload Avatar' })}
              category={FILE_CATEGORIES.AUTO_SERVICE_AVATARS}
              inputId="auto-service-avatar-upload-input"
              existingFiles={avatarFile ? [avatarFile] : []}
              onUpload={(files) => {
                if (files.length > 0) {
                  setAvatarFile(files[0]);
                  setAvatarFileId(files[0].id);
                }
              }}
              onRemove={() => {
                setAvatarFile(null);
                setAvatarFileId(undefined);
              }}
              disabled={isSubmitting || createMutation.isPending}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('avatarHint', {
                defaultValue: 'Upload a profile picture for your auto service (optional)',
              })}
            </p>
          </div>

          {/* Conditional Fields */}
          {watchedServiceType === 'company' ? (
            <div>
              <Input
                label={t('companyName', { defaultValue: 'Company Name' })}
                {...register('companyName')}
                error={errors.companyName?.message}
                required
                placeholder={t('companyNamePlaceholder', {
                  defaultValue: 'Enter your company name',
                })}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Input
                  label={t('firstName', { defaultValue: 'First Name' })}
                  {...register('firstName')}
                  error={errors.firstName?.message}
                  required
                  placeholder={t('firstNamePlaceholder', { defaultValue: 'Enter your first name' })}
                />
              </div>
              <div>
                <Input
                  label={t('lastName', { defaultValue: 'Last Name' })}
                  {...register('lastName')}
                  error={errors.lastName?.message}
                  required
                  placeholder={t('lastNamePlaceholder', { defaultValue: 'Enter your last name' })}
                />
              </div>
            </div>
          )}

          {/* Hidden serviceType field for form validation */}
          <input type="hidden" {...register('serviceType')} />

          {/* Submit Button */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting || createMutation.isPending}
            >
              {t('create', { defaultValue: 'Create Auto Service' })}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
