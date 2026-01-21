'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { z } from 'zod';

import { PHONE_PATTERN, PHONE_ERROR_MESSAGE } from '@/lib/utils/phone.util';

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
        city: z
          .string()
          .min(1, t('cityRequired', { defaultValue: 'City is required' }))
          .optional(),
        region: z
          .string()
          .min(1, t('regionRequired', { defaultValue: 'Region is required' }))
          .optional(),
        district: z.string().optional(),
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        phoneNumber: z
          .string()
          .min(1, t('phoneRequired', { defaultValue: 'Phone number is required' }))
          .regex(PHONE_PATTERN, t('invalidPhoneNumber', { defaultValue: PHONE_ERROR_MESSAGE })),
        maxVisitsPerDay: z.number().min(1).max(50),
        serviceTypes: z
          .array(z.string())
          .min(1, t('serviceTypesRequired', { defaultValue: 'Select at least one service type' })),
      }),
    [t]
  );

  return { schema };
}
