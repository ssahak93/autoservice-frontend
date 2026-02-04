'use client';

import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Search } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { visitsService } from '@/lib/services/visits.service';
import { cn } from '@/lib/utils/cn';
import { formatCustomerName } from '@/lib/utils/user';
import { chatService } from '@/modules/chat/services/chat.service';
import { useChatStore } from '@/modules/chat/state/chatStore';
import { useAutoServiceStore } from '@/stores/autoServiceStore';

// Lazy load chat components to reduce initial bundle size
const UnifiedChatWindow = dynamic(
  () =>
    import('@/components/chat/UnifiedChatWindow').then((mod) => ({
      default: mod.UnifiedChatWindow,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="md" className="mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading chat...</p>
        </div>
      </div>
    ),
  }
);
const ConversationList = dynamic(
  () => import('./ConversationList').then((mod) => ({ default: mod.ConversationList })),
  {
    ssr: false,
  }
);

export interface Conversation {
  visitId: string;
  visit: {
    id: string;
    scheduledDate: string;
    scheduledTime: string;
    status: string;
    problemDescription?: string;
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      avatarFile?: {
        fileUrl: string;
      };
    };
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
}

export function MessagesManagementContent() {
  const t = useTranslations('dashboard.messages');
  const { selectedAutoServiceId } = useAutoServiceStore();
  const { openChat } = useChatStore();
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get all visits for the auto service
  const { data: visitsData, isLoading } = useQuery({
    queryKey: ['autoServiceVisits', 'all', selectedAutoServiceId],
    queryFn: () =>
      visitsService.getAutoServiceList({
        limit: 1000,
        autoServiceId: selectedAutoServiceId || undefined,
      }), // Get all visits
    enabled: !!selectedAutoServiceId,
  });

  // Get conversations with last message and unread count
  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery({
    queryKey: ['conversations', visitsData?.data?.map((v) => v.id)],
    queryFn: async () => {
      if (!visitsData?.data) return [];

      const conversationsPromises = visitsData.data.map(async (visit) => {
        try {
          // Get last message
          const messagesResponse = await chatService.getMessages(visit.id, 1, 1);
          const lastMessage = messagesResponse.data[0];

          // Get unread count
          const unreadCount = await chatService.getUnreadCount(visit.id);

          return {
            visitId: visit.id,
            visit,
            lastMessage: lastMessage
              ? {
                  content: lastMessage.content,
                  createdAt: lastMessage.createdAt,
                  senderId: lastMessage.senderId,
                }
              : undefined,
            unreadCount,
          } as Conversation;
        } catch {
          // If error, return conversation without last message
          return {
            visitId: visit.id,
            visit,
            lastMessage: undefined,
            unreadCount: 0,
          } as Conversation;
        }
      });

      return Promise.all(conversationsPromises);
    },
    enabled: !!visitsData?.data && visitsData.data.length > 0,
  });

  // Filter conversations by search query
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const customerName = formatCustomerName(
      conv.visit.user.firstName,
      conv.visit.user.lastName,
      'customer'
    ).toLowerCase();
    const problemDescription = (conv.visit.problemDescription || '').toLowerCase();
    return customerName.includes(query) || problemDescription.includes(query);
  });

  // Sort conversations by last message date (most recent first)
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    const aDate = a.lastMessage?.createdAt || a.visit.scheduledDate;
    const bDate = b.lastMessage?.createdAt || b.visit.scheduledDate;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

  if (isLoading || isLoadingConversations) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 overflow-hidden px-2 py-2 sm:px-4 sm:py-4">
      {/* Conversations List */}
      <div
        className={cn(
          'flex w-full min-w-0 flex-col transition-transform duration-300 md:w-1/3',
          selectedVisitId || openChat ? 'hidden md:flex' : 'flex'
        )}
      >
        <div className="glass-light flex h-full min-h-0 flex-col rounded-xl p-3 sm:p-4">
          <div className="mb-4 flex-shrink-0">
            <h1 className="mb-4 text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
              {t('title', { defaultValue: 'Messages' })}
            </h1>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 sm:h-5 sm:w-5" />
              <input
                type="text"
                placeholder={t('searchPlaceholder', { defaultValue: 'Search conversations...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-9 py-2 text-sm text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 sm:px-10 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-primary-800"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            {sortedConversations.length === 0 ? (
              <div className="py-12 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-sm text-gray-600 sm:text-base dark:text-gray-400">
                  {t('noConversations', { defaultValue: 'No conversations yet' })}
                </p>
              </div>
            ) : (
              <ConversationList
                conversations={sortedConversations}
                selectedVisitId={selectedVisitId}
                onSelect={(visitId) => setSelectedVisitId(visitId)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Chat Window - Mobile: Full screen, Desktop: Side by side */}
      <div
        className={cn(
          'flex w-full min-w-0 flex-col transition-transform duration-300 md:w-2/3',
          selectedVisitId || openChat ? 'flex' : 'hidden md:flex'
        )}
      >
        {selectedVisitId ? (
          <div className="relative flex h-full flex-col">
            {/* Mobile back button */}
            <button
              onClick={() => setSelectedVisitId(null)}
              className="mb-2 flex-shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors active:bg-gray-100 md:hidden dark:text-gray-300 dark:active:bg-gray-700"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {t('common.back', { defaultValue: 'Back' })}
            </button>
            <div className="min-h-0 flex-1">
              <UnifiedChatWindow
                visitId={selectedVisitId}
                isOpen={!!selectedVisitId}
                onClose={() => setSelectedVisitId(null)}
                variant="embedded"
              />
            </div>
          </div>
        ) : (
          <div className="glass-light flex h-[calc(100vh-8rem)] items-center justify-center rounded-xl">
            <div className="text-center">
              <MessageSquare className="mx-auto h-16 w-16 text-gray-400" />
              <p className="mt-4 text-sm text-gray-600 sm:text-base dark:text-gray-400">
                {t('selectConversation', {
                  defaultValue: 'Select a conversation to start chatting',
                })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
