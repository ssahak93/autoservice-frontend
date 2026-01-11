'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { useNotificationStats } from '@/hooks/useNotifications';

import { NotificationList } from './NotificationList';

export function NotificationBell() {
  const t = useTranslations('notifications');
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const { data: stats } = useNotificationStats();
  const unreadCount = stats?.unread || 0;

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        aria-label={t('notifications')}
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-error-500 text-xs font-medium text-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="glass-light absolute right-0 top-full z-50 mt-2 w-[calc(100vw-2rem)] max-w-sm rounded-xl p-4 shadow-2xl sm:w-96"
            >
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">{t('title')}</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                  aria-label={t('close')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Notifications List (Limited) */}
              <div className="max-h-[400px] overflow-y-auto">
                <NotificationList compact />
              </div>

              {/* View All Link */}
              <div className="mt-4 border-t border-neutral-200 pt-4">
                <Link href={`/${locale}/notifications`} onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" fullWidth>
                    {t('viewAll', { defaultValue: 'View All' })}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
