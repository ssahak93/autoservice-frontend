'use client';

import { motion } from 'framer-motion';
import {
  Bell,
  CheckCircle2,
  MessageSquare,
  Calendar,
  Star,
  X,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useMarkNotificationAsRead, useDeleteNotification } from '@/hooks/useNotifications';
import { useVisit } from '@/hooks/useVisits';
import type { Notification } from '@/lib/services/notifications.service';
import { formatDateFull } from '@/lib/utils/date';

interface NotificationItemProps {
  notification: Notification;
  compact?: boolean;
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

export function NotificationItem({ notification, compact = false }: NotificationItemProps) {
  const t = useTranslations('notifications');
  const locale = useLocale();
  const markAsRead = useMarkNotificationAsRead();
  const deleteNotification = useDeleteNotification();
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();

  const Icon = notificationIcons[notification.type] || Bell;
  const colorClass = notificationColors[notification.type] || 'text-neutral-500';

  // Extract related IDs from notification data
  const visitId = notification.data?.visitId as string | undefined;
  const messageId = notification.data?.messageId as string | undefined;

  // Load visit data to determine if user is the service owner
  const { data: visit } = useVisit(visitId || null);

  // Determine navigation link based on notification type
  const getNotificationLink = () => {
    if (visitId) {
      // For visit-related notifications, determine if user is customer or provider
      // If visit.userId === user.id, user is the customer; otherwise they're provider/team member
      const isCustomer = visit?.userId === user?.id;

      // If user is customer, link to user visits; otherwise to dashboard visits
      if (isCustomer) {
        return `/${locale}/visits`;
      }
      return `/${locale}/dashboard/visits`;
    }
    if (messageId || notification.type === 'new_message') {
      return `/${locale}/dashboard/messages`;
    }
    return null;
  };

  const notificationLink = getNotificationLink();

  const handleMarkAsRead = () => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }
  };

  const handleDelete = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsDeleting(true);
    try {
      await deleteNotification.mutateAsync(notification.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClick = () => {
    handleMarkAsRead();
  };

  const content = (
    <div
      className={`glass-light group relative cursor-pointer rounded-lg p-4 transition-all hover:shadow-lg ${
        !notification.isRead
          ? 'border-l-4 border-primary-500 bg-primary-50/50'
          : 'hover:bg-neutral-50'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <motion.div
          className={`flex-shrink-0 ${colorClass}`}
          whileHover={{ scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Icon className="h-5 w-5" />
        </motion.div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h4
              className={`font-semibold ${!notification.isRead ? 'text-neutral-900' : 'text-neutral-700'}`}
            >
              {notification.title}
            </h4>
            <div className="flex items-center gap-2">
              {notification.isRead && (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-success-500" />
              )}
              {notificationLink && (
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-neutral-400 transition-colors group-hover:text-primary-500" />
              )}
            </div>
          </div>
          <p className="mb-2 line-clamp-2 text-sm text-neutral-600">{notification.message}</p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-neutral-500">
              {formatDateFull(notification.createdAt, locale)}
            </p>
            {notificationLink && !compact && (
              <span className="flex items-center gap-1 text-xs font-medium text-primary-600">
                {t('viewDetails', { defaultValue: 'View details' })}
                <ExternalLink className="h-3 w-3" />
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-shrink-0 gap-1" onClick={(e) => e.stopPropagation()}>
          {!notification.isRead && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAsRead();
              }}
              className="rounded p-1 text-neutral-400 transition-colors hover:bg-primary-100 hover:text-primary-600"
              aria-label={t('markAsRead')}
            >
              <CheckCircle2 className="h-4 w-4" />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded p-1 text-neutral-400 transition-colors hover:bg-error-50 hover:text-error-600 disabled:opacity-50"
            aria-label={t('delete')}
          >
            <X className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );

  // Wrap in Link if there's a navigation link
  if (notificationLink) {
    return (
      <Link href={notificationLink} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
