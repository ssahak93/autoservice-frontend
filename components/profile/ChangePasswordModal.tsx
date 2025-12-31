'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useChangePassword } from '@/hooks/useProfile';
import { getAnimationVariants } from '@/lib/utils/animations';

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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const variants = getAnimationVariants();

  const passwordSchema = z
    .object({
      currentPassword: z
        .string()
        .min(1, t('currentPasswordRequired', { defaultValue: 'Current password is required' })),
      newPassword: z
        .string()
        .min(8, t('passwordMinLength', { defaultValue: 'Password must be at least 8 characters' })),
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
                <div className="relative">
                  <Input
                    label={t('currentPassword', { defaultValue: 'Current Password' })}
                    type={showCurrentPassword ? 'text' : 'password'}
                    error={errors.currentPassword?.message}
                    disabled={changePassword.isPending}
                    autoComplete="current-password"
                    {...register('currentPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-[42px] text-neutral-500 hover:text-neutral-700"
                    aria-label={
                      showCurrentPassword
                        ? t('hidePassword', { defaultValue: 'Hide password' })
                        : t('showPassword', { defaultValue: 'Show password' })
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* New Password */}
                <div className="relative">
                  <Input
                    label={t('newPassword', { defaultValue: 'New Password' })}
                    type={showNewPassword ? 'text' : 'password'}
                    error={errors.newPassword?.message}
                    disabled={changePassword.isPending}
                    autoComplete="new-password"
                    helperText={t('passwordHelper', { defaultValue: 'At least 8 characters' })}
                    {...register('newPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-[42px] text-neutral-500 hover:text-neutral-700"
                    aria-label={
                      showNewPassword
                        ? t('hidePassword', { defaultValue: 'Hide password' })
                        : t('showPassword', { defaultValue: 'Show password' })
                    }
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <Input
                    label={t('confirmPassword', { defaultValue: 'Confirm Password' })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    error={errors.confirmPassword?.message}
                    disabled={changePassword.isPending}
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[42px] text-neutral-500 hover:text-neutral-700"
                    aria-label={
                      showConfirmPassword
                        ? t('hidePassword', { defaultValue: 'Hide password' })
                        : t('showPassword', { defaultValue: 'Show password' })
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

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
