'use client';

import { useQuery } from '@tanstack/react-query';
import { X, User, Calendar, Clock, AlertCircle, Phone } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { MessageInput } from '@/components/chat/MessageInput';
import { MessageList } from '@/components/chat/MessageList';
import { chatService } from '@/lib/services/chat.service';
import { visitsService } from '@/lib/services/visits.service';
import { cn } from '@/lib/utils/cn';

interface ChatWindowProps {
  visitId: string;
  onClose?: () => void;
}

export function ChatWindow({ visitId, onClose }: ChatWindowProps) {
  const t = useTranslations('dashboard.messages');

  // Get visit details
  const { data: visit } = useQuery({
    queryKey: ['visit', visitId],
    queryFn: async () => {
      const visits = await visitsService.getAutoServiceList({ limit: 1000 });
      return visits.data.find((v) => v.id === visitId);
    },
    enabled: !!visitId,
  });

  // Get unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadCount', visitId],
    queryFn: () => chatService.getUnreadCount(visitId),
    enabled: !!visitId,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const customerName =
    visit?.user?.firstName && visit?.user?.lastName
      ? `${visit.user.firstName} ${visit.user.lastName}`
      : visit?.user?.firstName || t('customer', { defaultValue: 'Customer' });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-400',
        border: 'border-yellow-300 dark:border-yellow-700',
      },
      confirmed: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-300 dark:border-green-700',
      },
      completed: {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-300 dark:border-emerald-700',
      },
      cancelled: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-300 dark:border-red-700',
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-400',
      border: 'border-gray-300 dark:border-gray-700',
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
        {status}
      </span>
    );
  };

  return (
    <div className="glass-light flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-xl shadow-lg">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        {/* Customer Info */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {visit?.user?.avatarFile?.fileUrl ? (
              <Image
                src={visit.user.avatarFile.fileUrl}
                alt={customerName}
                width={48}
                height={48}
                className="h-12 w-12 flex-shrink-0 rounded-full object-cover ring-2 ring-primary-200 dark:ring-primary-800"
                unoptimized
              />
            ) : (
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 ring-2 ring-primary-200 dark:bg-primary-900/30 dark:ring-primary-800">
                <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                  {customerName}
                </h3>
                {unreadCount > 0 && (
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-medium text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              {visit && (
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{visit.scheduledDate}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{visit.scheduledTime}</span>
                  </div>
                  {visit.status && getStatusBadge(visit.status)}
                </div>
              )}
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="flex-shrink-0 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              aria-label={t('close', { defaultValue: 'Close' })}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Visit Details */}
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

      {/* Messages - Scrollable */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <MessageList visitId={visitId} />
      </div>

      {/* Input - Fixed */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <MessageInput visitId={visitId} />
      </div>
    </div>
  );
}
