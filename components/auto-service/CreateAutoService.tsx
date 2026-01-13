'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { Link, useRouter } from '@/i18n/routing';
import {
  autoServicesService,
  MAX_AUTO_SERVICES_PER_USER,
} from '@/lib/services/auto-services.service';
import { useAuthStore } from '@/stores/authStore';
import { useAutoServiceStore } from '@/stores/autoServiceStore';
import { useUIStore } from '@/stores/uiStore';

export function CreateAutoService() {
  const t = useTranslations('myService.create');
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuth();
  const { setUser } = useAuthStore();
  const { availableAutoServices, setSelectedAutoServiceId, setAvailableAutoServices } =
    useAutoServiceStore();
  const [serviceType, setServiceType] = useState<'individual' | 'company'>('individual');
  const [mounted, setMounted] = useState(false);

  // Track mounted state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user has reached the maximum number of auto services
  // Use user.autoServices if available, otherwise fallback to availableAutoServices
  // Only calculate after mount to prevent hydration mismatch
  const ownedServicesCount = mounted
    ? user?.autoServices?.length || availableAutoServices.filter((s) => s.role === 'owner').length
    : 0;
  const canCreateMore = ownedServicesCount < MAX_AUTO_SERVICES_PER_USER;

  const schema = z
    .object({
      serviceType: z.enum(['individual', 'company'], {
        required_error: t('serviceTypeRequired', { defaultValue: 'Service type is required' }),
      }),
      companyName: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.serviceType === 'company') {
          return !!data.companyName && data.companyName.trim().length > 0;
        }
        return (
          !!data.firstName &&
          data.firstName.trim().length > 0 &&
          !!data.lastName &&
          data.lastName.trim().length > 0
        );
      },
      {
        message: t('validationError', {
          defaultValue: 'Please fill in all required fields',
        }),
        path: ['serviceType'],
      }
    )
    .superRefine((data, ctx) => {
      // Validate company name when service type is company
      if (data.serviceType === 'company') {
        if (!data.companyName || data.companyName.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('companyNameRequired', { defaultValue: 'Company name is required' }),
            path: ['companyName'],
          });
        }
      }
      // Validate first and last name when service type is individual
      if (data.serviceType === 'individual') {
        if (!data.firstName || data.firstName.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('firstNameRequired', { defaultValue: 'First name is required' }),
            path: ['firstName'],
          });
        }
        if (!data.lastName || data.lastName.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('lastNameRequired', { defaultValue: 'Last name is required' }),
            path: ['lastName'],
          });
        }
      }
    });

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

  const createMutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload: {
        serviceType: 'individual' | 'company';
        companyName?: string;
        firstName?: string;
        lastName?: string;
      } = {
        serviceType: data.serviceType,
      };

      if (data.serviceType === 'company') {
        payload.companyName = data.companyName?.trim();
      } else {
        payload.firstName = data.firstName?.trim();
        payload.lastName = data.lastName?.trim();
      }

      return autoServicesService.createAutoService(payload);
    },
    onSuccess: async (newService) => {
      // Select the newly created service immediately
      if (newService?.id) {
        setSelectedAutoServiceId(newService.id);
      }

      showToast(t('success', { defaultValue: 'Auto service created successfully' }), 'success');

      // Invalidate and refetch all related queries
      // This will update user data, available services, and profile
      await Promise.all([
        // Refetch user data to get updated autoServices list
        queryClient.refetchQueries({ queryKey: ['auth', 'me'] }),
        // Refetch available auto services
        queryClient.refetchQueries({ queryKey: ['availableAutoServices'] }),
        // Invalidate profile query (will be fetched when needed)
        queryClient.invalidateQueries({ queryKey: ['autoServiceProfile'] }),
      ]);

      // Update user data in Zustand store after refetch
      const updatedUser = queryClient.getQueryData(['auth', 'me']);
      if (updatedUser) {
        setUser(updatedUser as typeof user);
      }

      // Update availableAutoServices in store after refetch
      // Wait a bit for the query to complete
      setTimeout(() => {
        const updatedServices = queryClient.getQueryData(['availableAutoServices']);
        if (updatedServices && Array.isArray(updatedServices)) {
          setAvailableAutoServices(updatedServices);
        }
      }, 100);

      // Immediately redirect to my-service page to show the profile creation form
      // Remove create query parameter if present
      router.push('/my-service');
    },
    onError: (error: unknown) => {
      // Extract error message from backend response
      let errorMessage = t('error', { defaultValue: 'Failed to create auto service' });
      const errorObj = error as {
        response?: { data?: { error?: { message?: string }; message?: string } };
        message?: string;
      };

      // Check for backend error response format: { success: false, error: { message: string } }
      if (errorObj?.response?.data?.error?.message) {
        errorMessage = errorObj.response.data.error.message;
      } else if (errorObj?.response?.data?.message) {
        errorMessage = errorObj.response.data.message;
      } else if (errorObj?.message) {
        errorMessage = errorObj.message;
      }

      showToast(errorMessage, 'error');
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
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
                        {service.avatarFile && (
                          <Image
                            src={service.avatarFile.fileUrl}
                            alt={
                              service.serviceType === 'company'
                                ? service.companyName || 'Service'
                                : `${service.firstName} ${service.lastName}`
                            }
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover"
                            unoptimized
                          />
                        )}
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
