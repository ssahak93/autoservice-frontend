'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUpdateServiceInfo } from '@/hooks/useServiceInfoMutations';
import { useServiceInfoValidation } from '@/hooks/useServiceInfoValidation';
import { type AutoServiceProfile } from '@/lib/services/auto-service-profile.service';

interface ServiceInfoEditorProps {
  profile: AutoServiceProfile;
  onSuccess?: () => void;
}

export function ServiceInfoEditor({ profile, onSuccess }: ServiceInfoEditorProps) {
  const t = useTranslations('myService.info');

  // Memoize isCompany to prevent unnecessary recalculations
  const isCompany = useMemo(
    () => profile.autoService?.serviceType === 'company',
    [profile.autoService?.serviceType]
  );

  // Use custom hook for validation (SOLID - Single Responsibility)
  const { schema } = useServiceInfoValidation(isCompany);

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: profile.autoService?.companyName || '',
      firstName: profile.autoService?.firstName || '',
      lastName: profile.autoService?.lastName || '',
    },
  });

  // Use custom hook for update mutation (SOLID - Single Responsibility)
  const updateMutation = useUpdateServiceInfo();

  const onSubmit = (data: FormData) => {
    if (!profile.autoServiceId) {
      // Error will be handled by mutation hook
      return;
    }
    updateMutation.mutate(
      { autoServiceId: profile.autoServiceId, data },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          {t('title', { defaultValue: 'Service Information' })}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('editDescription', { defaultValue: 'Edit your service basic information' })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {isCompany ? (
          <div>
            <Input
              label={t('companyName', { defaultValue: 'Company Name' })}
              {...register('companyName')}
              error={errors.companyName?.message}
              required
            />
          </div>
        ) : (
          <>
            <div>
              <Input
                label={t('firstName', { defaultValue: 'First Name' })}
                {...register('firstName')}
                error={errors.firstName?.message}
                required
              />
            </div>
            <div>
              <Input
                label={t('lastName', { defaultValue: 'Last Name' })}
                {...register('lastName')}
                error={errors.lastName?.message}
                required
              />
            </div>
          </>
        )}

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {t('serviceType', { defaultValue: 'Service Type' })}
          </label>
          <p className="mt-1 capitalize text-gray-900 dark:text-white">
            {profile.autoService?.serviceType || '-'}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            {t('serviceTypeNote', { defaultValue: 'Service type cannot be changed' })}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting || updateMutation.isPending}
        >
          {t('save', { defaultValue: 'Save Changes' })}
        </Button>
      </div>
    </form>
  );
}
