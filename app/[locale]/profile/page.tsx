'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Phone, User as UserIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CreateServiceBanner } from '@/components/auto-service/CreateServiceBanner';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { ChangePasswordModal } from '@/components/profile/ChangePasswordModal';
import { SettingsSection } from '@/components/profile/SettingsSection';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProfile } from '@/hooks/useProfile';
import { getAnimationVariants } from '@/lib/utils/animations';
import {
  PHONE_PATTERN,
  PHONE_ERROR_MESSAGE,
  formatPhoneForBackend,
  parsePhoneFromBackend,
} from '@/lib/utils/phone.util';

/**
 * Profile Page Component
 *
 * Single Responsibility: Displays and manages user profile information
 * Responsive: Mobile-first design with breakpoints for tablet and desktop
 */
// Helper function to format dates consistently (always use same format to avoid hydration issues)
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    // Always use ISO format for consistent server/client rendering
    // Format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
};

export default function ProfilePage() {
  const t = useTranslations('profile');
  const { user, isLoading: isLoadingUser } = useAuth();
  const updateProfile = useUpdateProfile();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const variants = getAnimationVariants();

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Form validation schema
  const profileSchema = z.object({
    firstName: z
      .string()
      .min(1, t('firstNameRequired', { defaultValue: 'First name is required' })),
    lastName: z.string().min(1, t('lastNameRequired', { defaultValue: 'Last name is required' })),
    phoneNumber: z
      .string()
      .optional()
      .refine(
        (val) => !val || PHONE_PATTERN.test(val),
        t('invalidPhoneNumber', { defaultValue: PHONE_ERROR_MESSAGE })
      ),
  });

  type ProfileFormData = z.infer<typeof profileSchema>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
    },
  });

  // Reset form when user data changes (only after mount)
  useEffect(() => {
    if (mounted && user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: parsePhoneFromBackend(user.phoneNumber),
      });
    }
  }, [mounted, user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber ? formatPhoneForBackend(data.phoneNumber) : undefined,
      });
    } catch (error) {
      // Error is handled in the hook
    }
  };

  // Show loading during SSR and initial mount to prevent hydration mismatch
  if (!mounted || isLoadingUser) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!user) {
    return null;
  }

  const userName =
    `${user.firstName || ''} ${user.lastName || ''}`.trim() || t('user', { defaultValue: 'User' });

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        {/* Create Service Banner */}
        {mounted && (
          <div className="mb-6">
            <CreateServiceBanner />
          </div>
        )}

        {/* Header */}
        <motion.div
          variants={variants.slideUp}
          initial="initial"
          animate="animate"
          className="mb-6 sm:mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-2 text-sm text-neutral-600 sm:text-base">
            {t('subtitle', {
              defaultValue: 'Manage your personal information and account settings',
            })}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Profile Card - Left Sidebar */}
          <motion.div
            variants={variants.slideUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="glass-light rounded-xl p-6 sm:p-8">
              {/* Avatar */}
              <div className="mb-6" suppressHydrationWarning>
                <AvatarUpload
                  currentAvatarUrl={user.avatarUrl || user.avatarFile?.fileUrl}
                  userName={userName}
                />
              </div>

              {/* User Info */}
              <div className="space-y-4 text-center">
                <div>
                  <h2
                    className="font-display text-xl font-semibold text-neutral-900 sm:text-2xl"
                    suppressHydrationWarning
                  >
                    {userName}
                  </h2>
                  <div className="mt-2 flex items-center justify-center gap-2 text-sm text-neutral-600">
                    <Mail className="h-4 w-4" />
                    <span className="break-all" suppressHydrationWarning>
                      {user.email || ''}
                    </span>
                  </div>
                  {user.phoneNumber && (
                    <div
                      className="mt-2 flex items-center justify-center gap-2 text-sm text-neutral-600"
                      suppressHydrationWarning
                    >
                      <Phone className="h-4 w-4" />
                      <a
                        href={`tel:${user.phoneNumber}`}
                        className="hover:text-primary-600 hover:underline"
                      >
                        {user.phoneNumber}
                      </a>
                    </div>
                  )}
                </div>

                {/* Account Info */}
                <div className="border-t border-neutral-200 pt-4">
                  <div className="space-y-2 text-sm text-neutral-600">
                    <div className="flex items-center justify-between">
                      <span>{t('accountCreated', { defaultValue: 'Account created' })}</span>
                      <span className="font-medium text-neutral-900">
                        {user.createdAt
                          ? formatDate(user.createdAt)
                          : t('unknown', { defaultValue: 'Unknown' })}
                      </span>
                    </div>
                    {user.updatedAt && (
                      <div className="flex items-center justify-between">
                        <span>{t('lastUpdated', { defaultValue: 'Last updated' })}</span>
                        <span className="font-medium text-neutral-900">
                          {formatDate(user.updatedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Form - Right Side */}
          <motion.div
            variants={variants.slideUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="glass-light rounded-xl p-6 sm:p-8">
              {/* Form Header */}
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-primary-100 p-2">
                  <UserIcon className="h-5 w-5 text-primary-600 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-neutral-900 sm:text-2xl">
                    {t('personalInfo')}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-600">
                    {t('personalInfoDescription', {
                      defaultValue: 'Update your personal information and contact details',
                    })}
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label={t('firstName')}
                    placeholder={t('firstNamePlaceholder', {
                      defaultValue: 'Enter your first name',
                    })}
                    error={errors.firstName?.message}
                    disabled={updateProfile.isPending}
                    autoComplete="given-name"
                    {...register('firstName')}
                  />
                  <Input
                    label={t('lastName')}
                    placeholder={t('lastNamePlaceholder', { defaultValue: 'Enter your last name' })}
                    error={errors.lastName?.message}
                    disabled={updateProfile.isPending}
                    autoComplete="family-name"
                    {...register('lastName')}
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <Input
                    label={t('email')}
                    type="email"
                    value={user.email}
                    disabled
                    helperText={t('emailCannotBeChanged', {
                      defaultValue: 'Email cannot be changed',
                    })}
                    autoComplete="email"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field }) => (
                      <PhoneInput
                        label={t('phoneNumber')}
                        value={field.value || ''}
                        onChange={field.onChange}
                        error={errors.phoneNumber?.message}
                        disabled={updateProfile.isPending}
                        helperText={t('phoneNumberHelper', {
                          defaultValue:
                            'Optional. Enter 8 or 9 digits (e.g., 98222680 or 098222680)',
                        })}
                      />
                    )}
                  />
                </div>

                {/* Form Actions */}
                <div className="flex flex-col gap-3 border-t border-neutral-200 pt-6 sm:flex-row">
                  <Button
                    type="submit"
                    fullWidth
                    isLoading={updateProfile.isPending}
                    disabled={updateProfile.isPending || !isDirty}
                    className="sm:w-auto"
                  >
                    {t('saveChanges')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    onClick={() => setIsChangePasswordOpen(true)}
                    className="sm:w-auto"
                  >
                    {t('changePassword')}
                  </Button>
                  {isDirty && (
                    <Button
                      type="button"
                      variant="ghost"
                      fullWidth
                      onClick={() => reset()}
                      disabled={updateProfile.isPending}
                      className="sm:w-auto"
                    >
                      {t('cancel', { defaultValue: 'Cancel' })}
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Settings Section */}
        <motion.div
          variants={variants.slideUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
          className="mt-6 lg:mt-8"
        >
          <SettingsSection />
        </motion.div>

        {/* Change Password Modal */}
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
        />
      </div>
    </ProtectedRoute>
  );
}
