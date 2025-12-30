'use client';

import { format } from 'date-fns';
import { Bell, CheckCircle2, MessageSquare, Calendar, Star, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useMarkNotificationAsRead, useDeleteNotification } from '@/hooks/useNotifications';
import type { Notification } from '@/lib/services/notifications.service';

interface NotificationItemProps {
  notification: Notification;
}

const notificationIcons = {
  visit_confirmed: Calendar,
  visit_cancelled: Calendar,
  visit_reminder: Calendar,
  new_message: MessageSquare,
  review_received: Star,
  system: Bell,
};

const notificationColors = {
  visit_confirmed: 'text-success-500',
  visit_cancelled: 'text-error-500',
  visit_reminder: 'text-warning-500',
  new_message: 'text-primary-500',
  review_received: 'text-warning-500',
  system: 'text-neutral-500',
};

export function NotificationItem({ notification }: NotificationItemProps) {
  const t = useTranslations('notifications');
  const markAsRead = useMarkNotificationAsRead();
  const deleteNotification = useDeleteNotification();
  const [isDeleting, setIsDeleting] = useState(false);

  const Icon = notificationIcons[notification.type] || Bell;
  const colorClass = notificationColors[notification.type] || 'text-neutral-500';

  const handleMarkAsRead = () => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteNotification.mutateAsync(notification.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`glass-light rounded-lg p-4 transition-all hover:shadow-md ${
        !notification.isRead ? 'border-l-4 border-primary-500 bg-primary-50/50' : ''
      }`}
      onClick={handleMarkAsRead}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h4 className={`font-semibold ${!notification.isRead ? 'text-neutral-900' : 'text-neutral-700'}`}>
              {notification.title}
            </h4>
            {notification.isRead && (
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-success-500" />
            )}
          </div>
          <p className="mb-2 text-sm text-neutral-600">{notification.message}</p>
          <p className="text-xs text-neutral-500">
            {format(new Date(notification.createdAt), 'PPp')}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-shrink-0 gap-1">
          {!notification.isRead && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAsRead();
              }}
              className="rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-primary-600"
              aria-label={t('markAsRead')}
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            disabled={isDeleting}
            className="rounded p-1 text-neutral-400 transition-colors hover:bg-error-50 hover:text-error-600"
            aria-label={t('delete')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

