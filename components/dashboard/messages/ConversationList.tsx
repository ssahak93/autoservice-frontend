'use client';

import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

import { getTransition } from '@/lib/utils/animations';
import { cn } from '@/lib/utils/cn';
import { formatDate, formatDateTimeShort } from '@/lib/utils/date';
import { getAvatarUrl } from '@/lib/utils/file';
import { formatCustomerName } from '@/lib/utils/user';

import type { Conversation } from './MessagesManagementContent';

interface ConversationListProps {
  conversations: Conversation[];
  selectedVisitId: string | null;
  onSelect: (visitId: string) => void;
}

export function ConversationList({
  conversations,
  selectedVisitId,
  onSelect,
}: ConversationListProps) {
  const t = useTranslations('dashboard.messages');
  const locale = useLocale();

  const transition = getTransition(0.15);

  return (
    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
      {conversations.map((conversation, index) => {
        const isSelected = conversation.visitId === selectedVisitId;
        const customerName = formatCustomerName(
          conversation.visit.user.firstName,
          conversation.visit.user.lastName,
          t('customer', { defaultValue: 'Customer' })
        );

        return (
          <motion.button
            key={conversation.visitId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: index * 0.03 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(conversation.visitId)}
            className={cn(
              'w-full touch-manipulation rounded-lg border p-4 text-left transition-colors',
              isSelected
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'
            )}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                {getAvatarUrl(conversation.visit.user) ? (
                  <Image
                    src={getAvatarUrl(conversation.visit.user)!}
                    alt={customerName}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                    {customerName}
                  </h3>
                  {conversation.unreadCount > 0 && (
                    <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-medium text-white">
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </span>
                  )}
                </div>

                {conversation.lastMessage ? (
                  <>
                    <p className="mt-1 truncate text-sm text-gray-600 dark:text-gray-400">
                      {conversation.lastMessage.content || (
                        <span className="italic">
                          {t('imageMessage', { defaultValue: 'Image' })}
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                      {formatDateTimeShort(conversation.lastMessage.createdAt, locale)}
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                    {t('noMessages', { defaultValue: 'No messages yet' })}
                  </p>
                )}

                {/* Visit info */}
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                  <span>
                    {conversation.visit.scheduledDate
                      ? `${formatDate(conversation.visit.scheduledDate, locale)}${conversation.visit.scheduledTime ? `, ${conversation.visit.scheduledTime}` : ''}`
                      : '-'}
                  </span>
                  <span>•</span>
                  <span className="capitalize">{conversation.visit.status}</span>
                </div>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
