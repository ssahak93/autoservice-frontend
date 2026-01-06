'use client';

import { User } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function SecuritySettings() {
  const t = useTranslations('dashboard.settings.security');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('title', { defaultValue: 'Security Settings' })}
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {t('description', { defaultValue: 'Manage your account security settings' })}
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings Link */}
        <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
          <div className="mb-2 flex items-center gap-3">
            <User className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('profileSettings.title', { defaultValue: 'User Profile Settings' })}
            </h3>
          </div>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {t('profileSettings.description', {
              defaultValue:
                'Manage your personal information, password, and account settings. Auto service settings are managed separately.',
            })}
          </p>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
          >
            {t('profileSettings.link', { defaultValue: 'Go to Profile Settings →' })}
          </Link>
        </div>
      </div>
    </div>
  );
}
