'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Mail, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { settingsService, type UpdateSettingsData } from '@/lib/services/settings.service';
import { useUIStore } from '@/stores/uiStore';

export function NotificationSettings() {
  const t = useTranslations('dashboard.settings.notifications');
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings(),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateSettingsData) => {
      return settingsService.updateSettings(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      showToast(
        t('updateSuccess', { defaultValue: 'Notification settings updated successfully' }),
        'success'
      );
    },
    onError: (error: Error) => {
      showToast(
        error.message ||
          t('updateError', { defaultValue: 'Failed to update notification settings' }),
        'error'
      );
    },
  });

  const handleToggle = (key: keyof UpdateSettingsData) => {
    if (!settings) return;
    const currentValue = settings[key];
    if (typeof currentValue !== 'boolean') return;
    const newValue = !currentValue;
    updateMutation.mutate({ [key]: newValue } as UpdateSettingsData);
  };

  if (isLoading) {
    return <div className="py-8 text-center">Loading...</div>;
  }

  if (!settings) {
    return <div className="py-8 text-center">Failed to load settings</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('title', { defaultValue: 'Notification Settings' })}
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {t('description', { defaultValue: 'Manage how you receive notifications' })}
        </p>
      </div>

      <div className="space-y-6">
        {/* Email Notifications */}
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <div className="mb-4 flex items-center gap-3">
            <Mail className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('email.title', { defaultValue: 'Email Notifications' })}
            </h3>
          </div>
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('email.enable', { defaultValue: 'Enable email notifications' })}
              </span>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
                disabled={updateMutation.isPending}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <div className="mb-4 flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('push.title', { defaultValue: 'Push Notifications' })}
            </h3>
          </div>
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('push.enable', { defaultValue: 'Enable push notifications' })}
              </span>
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={() => handleToggle('pushNotifications')}
                disabled={updateMutation.isPending}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
          </div>
        </div>

        {/* Notification Types */}
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <div className="mb-4 flex items-center gap-3">
            <Bell className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('types.title', { defaultValue: 'Notification Types' })}
            </h3>
          </div>
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('types.newVisit', { defaultValue: 'New visit requests' })}
              </span>
              <input
                type="checkbox"
                checked={settings.newVisitNotification}
                onChange={() => handleToggle('newVisitNotification')}
                disabled={updateMutation.isPending}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('types.reminder', { defaultValue: 'Visit reminders' })}
              </span>
              <input
                type="checkbox"
                checked={settings.visitReminderNotification}
                onChange={() => handleToggle('visitReminderNotification')}
                disabled={updateMutation.isPending}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('types.message', { defaultValue: 'New messages' })}
              </span>
              <input
                type="checkbox"
                checked={settings.messageNotification}
                onChange={() => handleToggle('messageNotification')}
                disabled={updateMutation.isPending}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('types.teamInvite', { defaultValue: 'Team invitations' })}
              </span>
              <input
                type="checkbox"
                checked={settings.teamInviteNotification}
                onChange={() => handleToggle('teamInviteNotification')}
                disabled={updateMutation.isPending}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
