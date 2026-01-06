'use client';

import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { chatService } from '@/lib/services/chat.service';
import { visitsService } from '@/lib/services/visits.service';

import { ChatWindow } from './ChatWindow';
import { ConversationList } from './ConversationList';

interface Conversation {
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
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get all visits for the auto service
  const { data: visitsData, isLoading } = useQuery({
    queryKey: ['autoServiceVisits', 'all'],
    queryFn: () => visitsService.getAutoServiceList({ limit: 1000 }), // Get all visits
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
        } catch (error) {
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
    const customerName =
      `${conv.visit.user.firstName || ''} ${conv.visit.user.lastName || ''}`.toLowerCase();
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
    <div className="flex h-full gap-4 overflow-hidden px-4 py-4">
      {/* Conversations List */}
      <div className="flex w-full min-w-0 flex-col md:w-1/3">
        <div className="glass-light flex h-full min-h-0 flex-col rounded-xl p-4">
          <div className="mb-4 flex-shrink-0">
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              {t('title', { defaultValue: 'Messages' })}
            </h1>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchPlaceholder', { defaultValue: 'Search conversations...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-10 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            {sortedConversations.length === 0 ? (
              <div className="py-12 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
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

      {/* Chat Window */}
      <div className="flex hidden w-full min-w-0 flex-col md:block md:w-2/3">
        {selectedVisitId ? (
          <ChatWindow visitId={selectedVisitId} onClose={() => setSelectedVisitId(null)} />
        ) : (
          <div className="glass-light flex h-[calc(100vh-8rem)] items-center justify-center rounded-xl">
            <div className="text-center">
              <MessageSquare className="mx-auto h-16 w-16 text-gray-400" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">
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
