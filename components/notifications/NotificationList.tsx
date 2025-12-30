'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import {
  useNotifications,
  useMarkAllNotificationsAsRead,
  useDeleteAllReadNotifications,
} from '@/hooks/useNotifications';
import type { Notification } from '@/lib/services/notifications.service';

import { NotificationItem } from './NotificationItem';

type FilterType = 'all' | 'unread' | Notification['type'];

interface NotificationListProps {
  compact?: boolean;
}

export function NotificationList({ compact = false }: NotificationListProps) {
  const t = useTranslations('notifications');
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  const limit = 20;

  const filters = {
    page,
    limit,
    isRead: filter === 'unread' ? false : undefined,
    type: filter !== 'all' && filter !== 'unread' ? filter : undefined,
  };

  const { data, isLoading } = useNotifications(filters);
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteAllRead = useDeleteAllReadNotifications();

  const notifications = data?.data || [];
  const pagination = data?.pagination;

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: t('filters.all') },
    { value: 'unread', label: t('filters.unread') },
    { value: 'visit_confirmed', label: t('filters.visitConfirmed') },
    { value: 'visit_cancelled', label: t('filters.visitCancelled') },
    { value: 'new_message', label: t('filters.newMessage') },
    { value: 'review_received', label: t('filters.reviewReceived') },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">{t('title')}</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending || notifications.length === 0}
              isLoading={markAllAsRead.isPending}
            >
              <CheckCheck className="h-4 w-4" />
              {t('markAllAsRead')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteAllRead.mutate()}
              disabled={deleteAllRead.isPending}
              isLoading={deleteAllRead.isPending}
            >
              <Trash2 className="h-4 w-4" />
              {t('deleteAllRead')}
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      {!compact && (
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setFilter(option.value);
                setPage(1);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === option.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={t('noNotifications')}
          description={t('noNotificationsDescription')}
        />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${filter}-${page}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <NotificationItem notification={notification} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {!compact && pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            {t('previous')}
          </Button>
          <span className="text-sm text-neutral-600">
            {t('page')} {page} {t('of')} {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
          >
            {t('next')}
          </Button>
        </div>
      )}
    </div>
  );
}

