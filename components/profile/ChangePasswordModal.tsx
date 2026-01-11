'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useChangePassword } from '@/hooks/useProfile';
import { getAnimationVariants } from '@/lib/utils/animations';
import { PASSWORD_PATTERN, PASSWORD_ERROR_MESSAGE } from '@/lib/utils/password.util';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ChangePasswordModal Component
 *
 * Single Responsibility: Handles password change form UI and logic
 */
export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const t = useTranslations('profile');
  const changePassword = useChangePassword();
  const variants = getAnimationVariants();

  const passwordSchema = z
    .object({
      currentPassword: z
        .string()
        .min(1, t('currentPasswordRequired', { defaultValue: 'Current password is required' })),
      newPassword: z
        .string()
        .min(8, t('passwordMinLength', { defaultValue: 'Password must be at least 8 characters' }))
        .regex(
          PASSWORD_PATTERN,
          t('passwordInvalid', {
            defaultValue: PASSWORD_ERROR_MESSAGE,
          })
        ),
      confirmPassword: z
        .string()
        .min(1, t('confirmPasswordRequired', { defaultValue: 'Please confirm your password' })),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('passwordsDontMatch', { defaultValue: "Passwords don't match" }),
      path: ['confirmPassword'],
    });

  type PasswordFormData = z.infer<typeof passwordSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: PasswordFormData) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      reset();
      onClose();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={variants.modal}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="glass-light w-full max-w-md rounded-2xl p-6 shadow-2xl sm:p-8"
              role="dialog"
              aria-modal="true"
              aria-labelledby="change-password-title"
            >
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <h2
                  id="change-password-title"
                  className="font-display text-2xl font-bold text-neutral-900 sm:text-3xl"
                >
                  {t('changePassword')}
                </h2>
                <button
                  onClick={handleClose}
                  className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label={t('close', { defaultValue: 'Close' })}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Current Password */}
                <PasswordInput
                  label={t('currentPassword', { defaultValue: 'Current Password' })}
                  error={errors.currentPassword?.message}
                  disabled={changePassword.isPending}
                  autoComplete="current-password"
                  {...register('currentPassword')}
                />

                {/* New Password */}
                <PasswordInput
                  label={t('newPassword', { defaultValue: 'New Password' })}
                  error={errors.newPassword?.message}
                  disabled={changePassword.isPending}
                  autoComplete="new-password"
                  helperText={t('passwordHelper', { defaultValue: 'At least 8 characters' })}
                  {...register('newPassword')}
                />

                {/* Confirm Password */}
                <PasswordInput
                  label={t('confirmPassword', { defaultValue: 'Confirm Password' })}
                  error={errors.confirmPassword?.message}
                  disabled={changePassword.isPending}
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                />

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    onClick={handleClose}
                    disabled={changePassword.isPending}
                  >
                    {t('cancel', { defaultValue: 'Cancel' })}
                  </Button>
                  <Button
                    type="submit"
                    fullWidth
                    isLoading={changePassword.isPending}
                    disabled={changePassword.isPending}
                  >
                    {t('saveChanges')}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
