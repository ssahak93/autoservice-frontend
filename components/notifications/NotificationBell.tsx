'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { useNotificationStats } from '@/hooks/useNotifications';
import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/stores/authStore';

import { NotificationList } from './NotificationList';

export function NotificationBell() {
  const t = useTranslations('notifications');
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, accessToken } = useAuthStore();

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const { data: stats } = useNotificationStats();
  const unreadCount = stats?.unread || 0;

  // Check if we have a token (either in store or localStorage)
  const hasToken =
    typeof window !== 'undefined' && (!!accessToken || !!localStorage.getItem('accessToken'));

  // Don't render if not authenticated or no token
  if (!isAuthenticated || !hasToken) {
    return null;
  }

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
                <Link href="/notifications" onClick={() => setIsOpen(false)}>
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
