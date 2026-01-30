'use client';

import { motion } from 'framer-motion';
import { MessageSquare, HelpCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils/cn';
import { AdminConversationsList } from '@/modules/chat/components/AdminConversationsList';
import { useChatStore } from '@/modules/chat/state/chatStore';

// Lazy load chat window to reduce initial bundle size
const ChatWindowDynamic = dynamic(
  () => import('@/modules/chat/components/ChatWindow').then((mod) => ({ default: mod.ChatWindow })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading chat...</p>
        </div>
      </div>
    ),
  }
);

export function SupportChatContent() {
  const t = useTranslations('support');
  const { openChat, closeChat } = useChatStore();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="rounded-full bg-primary-100 p-3 dark:bg-primary-900/30">
            <HelpCircle className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('title', { defaultValue: 'Support Chat' })}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {t('description', { defaultValue: 'Get help from our support team' })}
            </p>
          </div>
        </motion.div>
      </div>

      <div className="flex h-[calc(100vh-12rem)] gap-4 overflow-hidden">
        {/* Conversations List */}
        <div
          className={cn(
            'flex w-full min-w-0 flex-col transition-transform duration-300 md:w-1/3',
            openChat?.conversationId ? 'hidden md:flex' : 'flex'
          )}
        >
          <div className="glass-light flex h-full min-h-0 flex-col rounded-xl p-4">
            <div className="mb-4 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('conversations', { defaultValue: 'Conversations' })}
              </h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('conversationsDescription', {
                  defaultValue: 'Your support conversations with our team',
                })}
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              <AdminConversationsList />
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <div
          className={cn(
            'flex w-full min-w-0 flex-col transition-transform duration-300 md:w-2/3',
            openChat?.conversationId ? 'flex' : 'hidden md:flex'
          )}
        >
          {openChat?.conversationId ? (
            <div className="relative h-full">
              {/* Mobile back button */}
              <button
                onClick={() => closeChat()}
                className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors active:bg-gray-100 md:hidden dark:text-gray-300 dark:active:bg-gray-700"
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
                {t('back', { defaultValue: 'Back' })}
              </button>
              <ChatWindowDynamic
                conversationId={openChat.conversationId}
                isOpen={true}
                onClose={() => closeChat()}
              />
            </div>
          ) : (
            <div className="glass-light flex h-full items-center justify-center rounded-xl">
              <div className="text-center">
                <MessageSquare className="mx-auto h-16 w-16 text-gray-400" />
                <p className="mt-4 text-sm text-gray-600 sm:text-base dark:text-gray-400">
                  {t('selectConversation', {
                    defaultValue: 'Select a conversation to start chatting with support',
                  })}
                </p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {t('selectConversationHint', {
                    defaultValue: 'Or create a new conversation to get help',
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
