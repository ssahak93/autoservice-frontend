'use client';

import { useTranslations } from 'next-intl';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotificationList } from '@/components/notifications/NotificationList';

export default function NotificationsPage() {
  const t = useTranslations('notifications');

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-neutral-900">
            {t('title', { defaultValue: 'Notifications' })}
          </h1>
          <p className="mt-2 text-neutral-600">
            {t('subtitle', { defaultValue: 'Manage and view all your notifications' })}
          </p>
        </div>
        <NotificationList />
      </div>
    </ProtectedRoute>
  );
}
