'use client';

import { useQuery } from '@tanstack/react-query';
import { X, User, Calendar, AlertCircle, Phone } from 'lucide-react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useMemo, useEffect } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useVisit } from '@/hooks/useVisits';
import { cn } from '@/lib/utils/cn';
import { formatDateTime } from '@/lib/utils/date';
import { getAvatarUrl } from '@/lib/utils/file';
import { formatCustomerName } from '@/lib/utils/user';
import { MessageInput } from '@/modules/chat/components/MessageInput';
import { MessageList } from '@/modules/chat/components/MessageList';
import { chatService } from '@/modules/chat/services/chat.service';

interface UnifiedChatWindowProps {
  visitId?: string | null;
  conversationId?: string | null;
  title?: string;
  serviceName?: string;
  isOpen: boolean;
  onClose: () => void;
  variant?: 'modal' | 'fullscreen' | 'embedded';
}

/**
 * Unified Chat Window Component
 *
 * Single Responsibility: Provides a consistent chat interface for all chat types
 * (visits, support, dashboard messages)
 *
 * Features:
 * - Fullscreen or modal mode
 * - Proper date formatting with locale support
 * - Typing indicator (handled by MessageList)
 * - Single scroll container (no page scroll)
 * - Visit information display with proper date formatting
 */
export function UnifiedChatWindow({
  visitId,
  conversationId,
  title,
  serviceName: _serviceName,
  isOpen,
  onClose,
  variant = 'fullscreen',
}: UnifiedChatWindowProps) {
  const t = useTranslations('chat');
  const tDashboard = useTranslations('dashboard.messages');
  const locale = useLocale();
  const { user } = useAuth();

  // Get visit details for visit chats
  const { data: visit, isLoading: isLoadingVisit } = useVisit(visitId || null);

  // Get unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadCount', visitId],
    queryFn: () => chatService.getUnreadCount(visitId!),
    enabled: !!visitId,
    refetchInterval: 5000,
  });

  // Determine participant info (always show the OTHER participant, not ourselves)
  const participantInfo = useMemo(() => {
    // Admin conversation
    if (conversationId && title) {
      return {
        name: title,
        avatarUrl: null,
      };
    }

    // Visit chat
    if (isLoadingVisit || !visit || !user) {
      return {
        name: t('chat', { defaultValue: 'Chat' }),
        avatarUrl: null,
      };
    }

    // Check if current user is the customer (visit.userId === user.id)
    const isCurrentUserCustomer = visit.userId === user.id;

    if (isCurrentUserCustomer) {
      // Current user is customer, show auto service info
      if (visit.autoServiceProfile?.autoService) {
        const autoService = visit.autoServiceProfile.autoService;
        const name = formatServiceName(
          autoService.companyName,
          autoService.firstName,
          autoService.lastName,
          t('service', { defaultValue: 'Service' })
        );
        return {
          name,
          avatarUrl: getAvatarUrl(autoService),
        };
      }
      return {
        name: t('service', { defaultValue: 'Service' }),
        avatarUrl: null,
      };
    } else {
      // Current user is auto service (or team member), show customer info
      const name = formatCustomerName(
        visit.user?.firstName,
        visit.user?.lastName,
        t('customer', { defaultValue: 'Customer' })
      );
      return {
        name,
        avatarUrl: getAvatarUrl(visit.user),
      };
    }
  }, [visit, isLoadingVisit, user, t, conversationId, title]);

  const participantName = participantInfo.name;

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-400',
        border: 'border-yellow-300 dark:border-yellow-700',
        label: tDashboard('pending', { defaultValue: 'Pending' }),
      },
      confirmed: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-300 dark:border-green-700',
        label: tDashboard('confirmed', { defaultValue: 'Confirmed' }),
      },
      completed: {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-300 dark:border-emerald-700',
        label: tDashboard('completed', { defaultValue: 'Completed' }),
      },
      cancelled: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-300 dark:border-red-700',
        label: tDashboard('cancelled', { defaultValue: 'Cancelled' }),
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-400',
      border: 'border-gray-300 dark:border-gray-700',
      label: status,
    };

    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
          config.bg,
          config.text,
          config.border
        )}
      >
        {config.label}
      </span>
    );
  };

  // Prevent body scroll when fullscreen chat is open
  useEffect(() => {
    if (variant === 'fullscreen' && isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [variant, isOpen]);

  if (!isOpen) {
    return null;
  }

  // Container classes based on variant
  const containerClasses = {
    modal: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4',
    fullscreen: 'fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900',
    embedded: 'flex h-full flex-col',
  };

  const chatClasses = {
    modal:
      'glass-light flex h-[90vh] max-h-[800px] w-full max-w-4xl flex-col overflow-hidden rounded-2xl shadow-2xl',
    fullscreen: 'flex h-full flex-col overflow-hidden',
    embedded:
      'flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700',
  };

  return (
    <div className={containerClasses[variant]} onClick={variant === 'modal' ? onClose : undefined}>
      <div
        className={chatClasses[variant]}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="chat-title"
        aria-modal={variant === 'modal' || variant === 'fullscreen'}
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          {/* Participant Info */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {/* Avatar */}
              {participantInfo.avatarUrl ? (
                <Image
                  src={participantInfo.avatarUrl}
                  alt={participantName}
                  width={48}
                  height={48}
                  className="h-12 w-12 flex-shrink-0 rounded-full object-cover ring-2 ring-primary-200 dark:ring-primary-800"
                  loading="eager"
                  unoptimized
                />
              ) : (
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 ring-2 ring-primary-200 dark:bg-primary-900/30 dark:ring-primary-800">
                  <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
              )}

              {/* Name and Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    id="chat-title"
                    className="truncate font-semibold text-gray-900 dark:text-white"
                  >
                    {participantName}
                  </h3>
                  {unreadCount > 0 && (
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-medium text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>

                {/* Visit Details */}
                {visit && (
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {visit.scheduledDate && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {formatDateTime(visit.scheduledDate, visit.scheduledTime, locale)}
                        </span>
                      </div>
                    )}
                    {visit.status && getStatusBadge(visit.status)}
                  </div>
                )}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              aria-label={t('close', { defaultValue: 'Close' })}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Visit Details Section */}
          {visit && (
            <div className="space-y-2 border-t border-gray-100 px-4 pb-3 pt-3 dark:border-gray-700/50">
              {visit.problemDescription && (
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                  <p className="line-clamp-2 text-gray-700 dark:text-gray-300">
                    {visit.problemDescription}
                  </p>
                </div>
              )}
              {visit.user?.phoneNumber && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="h-4 w-4" />
                  <span>{visit.user.phoneNumber}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Messages - Scrollable (only this scrolls) */}
        <div className="min-h-0 flex-1 overflow-hidden">
          <MessageList
            visitId={visitId || null}
            conversationId={conversationId || null}
            isReadOnly={visit?.status === 'completed' || visit?.status === 'cancelled'}
          />
        </div>

        {/* Input - Fixed */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          {visit?.status === 'completed' || visit?.status === 'cancelled' ? (
            <div className="flex items-center justify-center gap-2 px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
              <AlertCircle className="h-4 w-4" />
              <span>
                {t('chatClosed', {
                  defaultValue: 'This conversation is closed. You can only read messages.',
                })}
              </span>
            </div>
          ) : (
            <MessageInput visitId={visitId || null} conversationId={conversationId || null} />
          )}
        </div>
      </div>
    </div>
  );
}
