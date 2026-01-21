'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { z } from 'zod';

/**
 * Hook for auto service form validation schemas
 * Follows Single Responsibility Principle - handles only validation logic
 */
export function useAutoServiceValidation() {
  const t = useTranslations('myService.create');

  const schema = useMemo(
    () =>
      z
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
        }),
    [t]
  );

  return { schema };
}
