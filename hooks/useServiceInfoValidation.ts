'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { z } from 'zod';

import { commonValidations } from '@/lib/utils/validation';

/**
 * Hook for service info form validation schemas
 * Follows Single Responsibility Principle - handles only validation logic
 */
export function useServiceInfoValidation(isCompany: boolean) {
  const t = useTranslations('myService.info');

  const schema = useMemo(
    () =>
      z.object({
        companyName: isCompany
          ? z
              .string()
              .min(1, t('companyNameRequired', { defaultValue: 'Company name is required' }))
          : z.string().optional(),
        firstName: !isCompany
          ? commonValidations.firstName(
              t('firstNameRequired', { defaultValue: 'First name is required' })
            )
          : z.string().optional(),
        lastName: !isCompany
          ? commonValidations.lastName(
              t('lastNameRequired', { defaultValue: 'Last name is required' })
            )
          : z.string().optional(),
      }),
    [isCompany, t]
  );

  return { schema };
}
