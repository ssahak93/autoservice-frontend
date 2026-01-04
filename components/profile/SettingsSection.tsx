'use client';

import { motion } from 'framer-motion';
import { Bell, Globe, Lock, Shield, Trash2, User } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { useSettings, useUpdateSetting } from '@/hooks/useSettings';
import { getAnimationVariants } from '@/lib/utils/animations';
import { cn } from '@/lib/utils/cn';

interface SettingsSectionProps {
  className?: string;
}

/**
 * Settings Section Component
 *
 * Single Responsibility: Displays user settings UI
 * Now integrated with backend API
 */
export function SettingsSection({ className }: SettingsSectionProps) {
  const t = useTranslations('profile.settings');
  const locale = useLocale();
  const variants = getAnimationVariants();
  const { data: settings, isLoading: isLoadingSettings } = useSettings();
  const updateSetting = useUpdateSetting();

  const handleToggle = async (category: 'notifications' | 'privacy' | 'security', key: string) => {
    if (!settings) return;

    // Get current value
    const currentValue = getSettingValue(settings, category, key);
    const newValue = typeof currentValue === 'boolean' ? !currentValue : currentValue;

    // Update setting
    await updateSetting.mutateAsync({
      category,
      key,
      value: newValue,
    });
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion endpoint in backend
    if (
      confirm(
        t('dangerZone.deleteAccountConfirm', {
          defaultValue:
            'Are you sure you want to delete your account? This action cannot be undone.',
        })
      )
    ) {
      // await settingsService.deleteAccount();
      // Account deletion requested - handled by mutation
    }
  };

  // Helper function to get setting value
  const getSettingValue = (
    settingsData: typeof settings,
    category: 'notifications' | 'privacy' | 'security',
    key: string
  ): boolean | string => {
    if (!settingsData) return false;

    const valueMap: Record<string, keyof typeof settingsData> = {
      'notifications.email': 'emailNotifications',
      'notifications.push': 'pushNotifications',
      'notifications.sms': 'smsNotifications',
      'privacy.showPhone': 'showPhoneNumber',
      'privacy.showEmail': 'showEmail',
      'privacy.profileVisibility': 'profileVisibility',
      'security.twoFactor': 'twoFactorEnabled',
    };

    const field = valueMap[`${category}.${key}`];
    return field ? (settingsData[field] as boolean | string) : false;
  };

  // Default settings if loading or not available
  const defaultSettings = {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    showPhoneNumber: true,
    showEmail: false,
    profileVisibility: 'public' as const,
    twoFactorEnabled: false,
  };

  const currentSettings = settings || defaultSettings;
  const isLoading = isLoadingSettings || updateSetting.isPending;

  const SettingItem = ({
    icon: Icon,
    title,
    description,
    action,
    children,
  }: {
    icon: React.ElementType;
    title: string;
    description?: string;
    action?: React.ReactNode;
    children?: React.ReactNode;
  }) => (
    <div className="flex items-start gap-4 border-b border-neutral-200 py-4 last:border-b-0">
      <div className="rounded-lg bg-primary-100 p-2">
        <Icon className="h-5 w-5 text-primary-600" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-neutral-900">{title}</h4>
        {description && <p className="mt-1 text-sm text-neutral-600">{description}</p>}
        {children}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );

  const ToggleSwitch = ({
    enabled,
    onChange,
    disabled,
  }: {
    enabled: boolean;
    onChange: () => void;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled || isLoading}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        enabled ? 'bg-primary-500' : 'bg-neutral-300',
        disabled && 'cursor-not-allowed opacity-50'
      )}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          enabled ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );

  return (
    <motion.div
      variants={variants.slideUp}
      initial="initial"
      animate="animate"
      transition={{ delay: 0.3 }}
      className={cn('glass-light rounded-xl p-6 sm:p-8', className)}
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-primary-100 p-2">
          <Shield className="h-5 w-5 text-primary-600 sm:h-6 sm:w-6" />
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold text-neutral-900 sm:text-2xl">
            {t('title', { defaultValue: 'Settings' })}
          </h3>
          <p className="mt-1 text-sm text-neutral-600">
            {t('description', { defaultValue: 'Manage your account settings and preferences' })}
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="mb-4 flex items-center justify-center">
          <LoadingSpinner size="sm" />
        </div>
      )}

      {/* Notifications Section */}
      <div className="mb-8">
        <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900">
          <Bell className="h-5 w-5" />
          {t('notifications.title', { defaultValue: 'Notifications' })}
        </h4>
        <div className="space-y-1">
          <SettingItem
            icon={Bell}
            title={t('notifications.email', { defaultValue: 'Email Notifications' })}
            description={t('notifications.emailDescription', {
              defaultValue: 'Receive notifications via email',
            })}
            action={
              <ToggleSwitch
                enabled={currentSettings.emailNotifications}
                onChange={() => handleToggle('notifications', 'email')}
                disabled={isLoading}
              />
            }
          />
          <SettingItem
            icon={Bell}
            title={t('notifications.push', { defaultValue: 'Push Notifications' })}
            description={t('notifications.pushDescription', {
              defaultValue: 'Receive push notifications in your browser',
            })}
            action={
              <ToggleSwitch
                enabled={currentSettings.pushNotifications}
                onChange={() => handleToggle('notifications', 'push')}
                disabled={isLoading}
              />
            }
          />
          <SettingItem
            icon={Bell}
            title={t('notifications.sms', { defaultValue: 'SMS Notifications' })}
            description={t('notifications.smsDescription', {
              defaultValue: 'Receive notifications via SMS',
            })}
            action={
              <ToggleSwitch
                enabled={currentSettings.smsNotifications}
                onChange={() => handleToggle('notifications', 'sms')}
                disabled={isLoading}
              />
            }
          />
        </div>
      </div>

      {/* Privacy Section */}
      <div className="mb-8">
        <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900">
          <Lock className="h-5 w-5" />
          {t('privacy.title', { defaultValue: 'Privacy' })}
        </h4>
        <div className="space-y-1">
          <SettingItem
            icon={User}
            title={t('privacy.showPhone', { defaultValue: 'Show Phone Number' })}
            description={t('privacy.showPhoneDescription', {
              defaultValue: 'Allow others to see your phone number',
            })}
            action={
              <ToggleSwitch
                enabled={currentSettings.showPhoneNumber}
                onChange={() => handleToggle('privacy', 'showPhone')}
                disabled={isLoading}
              />
            }
          />
          <SettingItem
            icon={User}
            title={t('privacy.showEmail', { defaultValue: 'Show Email' })}
            description={t('privacy.showEmailDescription', {
              defaultValue: 'Allow others to see your email address',
            })}
            action={
              <ToggleSwitch
                enabled={currentSettings.showEmail}
                onChange={() => handleToggle('privacy', 'showEmail')}
                disabled={isLoading}
              />
            }
          />
        </div>
      </div>

      {/* Security Section */}
      <div className="mb-8">
        <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900">
          <Shield className="h-5 w-5" />
          {t('security.title', { defaultValue: 'Security' })}
        </h4>
        <div className="space-y-1">
          <SettingItem
            icon={Shield}
            title={t('security.twoFactor', { defaultValue: 'Two-Factor Authentication' })}
            description={t('security.twoFactorDescription', {
              defaultValue: 'Add an extra layer of security to your account',
            })}
            action={
              <ToggleSwitch
                enabled={currentSettings.twoFactorEnabled}
                onChange={() => handleToggle('security', 'twoFactor')}
                disabled={isLoading}
              />
            }
          />
        </div>
      </div>

      {/* Language Section */}
      <div className="mb-8">
        <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900">
          <Globe className="h-5 w-5" />
          {t('language.title', { defaultValue: 'Language' })}
        </h4>
        <SettingItem
          icon={Globe}
          title={t('language.interface', { defaultValue: 'Interface Language' })}
          description={t('language.interfaceDescription', {
            defaultValue: 'Choose your preferred language',
          })}
          action={
            <div className="text-sm font-medium text-neutral-700">
              {locale === 'hy' ? 'Հայերեն' : locale === 'ru' ? 'Русский' : 'English'}
            </div>
          }
        >
          <p className="mt-2 text-xs text-neutral-500">
            {t('language.note', {
              defaultValue:
                'Language is managed globally. Use the language switcher in the header.',
            })}
          </p>
        </SettingItem>
      </div>

      {/* Danger Zone */}
      <div className="border-t border-error-200 pt-6">
        <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-error-600">
          <Trash2 className="h-5 w-5" />
          {t('dangerZone.title', { defaultValue: 'Danger Zone' })}
        </h4>
        <SettingItem
          icon={Trash2}
          title={t('dangerZone.deleteAccount', { defaultValue: 'Delete Account' })}
          description={t('dangerZone.deleteAccountDescription', {
            defaultValue:
              'Permanently delete your account and all associated data. This action cannot be undone.',
          })}
          action={
            <Button variant="danger" size="sm" onClick={handleDeleteAccount} disabled={isLoading}>
              {t('dangerZone.delete', { defaultValue: 'Delete' })}
            </Button>
          }
        />
      </div>
    </motion.div>
  );
}
