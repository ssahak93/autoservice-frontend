'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { z } from 'zod';

import { commonValidations } from '@/lib/utils/validation';

/**
 * Hook for profile form validation schemas
 * Follows Single Responsibility Principle - handles only validation logic
 */
export function useProfileValidation() {
  const t = useTranslations('myService.profile');

  const schema = useMemo(
    () =>
      z.object({
        description: z
          .string()
          .min(
            10,
            t('descriptionMin', { defaultValue: 'Description must be at least 10 characters' })
          ),
        specialization: z.string().optional(),
        yearsOfExperience: z.number().min(0).max(100).optional(),
        address: z.string().min(1, t('addressRequired', { defaultValue: 'Address is required' })),
        regionId: z.string().min(1, t('regionRequired', { defaultValue: 'Region is required' })),
        communityId: z
          .string()
          .min(1, t('communityRequired', { defaultValue: 'Community is required' })),
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        phoneNumber: commonValidations.phoneRequired(
          t('phoneRequired', { defaultValue: 'Phone number is required' }),
          t('invalidPhoneNumber', {
            defaultValue:
              'Phone number must be 8 digits (e.g., 98222680) or 9 digits starting with 0 (e.g., 098222680)',
          })
        ),
        maxVisitsPerDay: z.number().min(1).max(50),
        serviceTypes: z
          .array(z.string())
          .min(1, t('serviceTypesRequired', { defaultValue: 'Select at least one service type' })),
      }),
    [t]
  );

  return { schema };
}
