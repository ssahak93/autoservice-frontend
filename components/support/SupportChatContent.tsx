'use client';

import { MessageSquare, HelpCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { cn } from '@/lib/utils/cn';
import { AdminConversationsList } from '@/modules/chat/components/AdminConversationsList';

// Lazy load chat window to reduce initial bundle size
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
          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading chat...</p>
        </div>
      </div>
    ),
  }
);

export function SupportChatContent() {
  const t = useTranslations('support');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedConversationTitle, setSelectedConversationTitle] = useState<string | undefined>(
    undefined
  );

  return (
    <ProtectedRoute>
      <div className="flex h-[calc(100vh-8rem)] gap-4 overflow-hidden px-2 py-2 sm:px-4 sm:py-4">
        {/* Conversations List */}
        <div
          className={cn(
            'flex w-full min-w-0 flex-col transition-transform duration-300 md:w-1/3',
            selectedConversationId ? 'hidden md:flex' : 'flex'
          )}
        >
          <div className="glass-light flex h-full min-h-0 flex-col rounded-xl p-3 sm:p-4">
            <div className="mb-4 flex-shrink-0">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-primary-100 p-2 dark:bg-primary-900/30">
                  <HelpCircle className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                    {t('title', { defaultValue: 'Support Chat' })}
                  </h1>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t('description', { defaultValue: 'Get help from our support team' })}
                  </p>
                </div>
              </div>
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
              <AdminConversationsList
                onConversationSelect={(conversationId, title) => {
                  setSelectedConversationId(conversationId);
                  setSelectedConversationTitle(title);
                }}
                selectedConversationId={selectedConversationId}
              />
            </div>
          </div>
        </div>

        {/* Chat Window - Mobile: Full screen, Desktop: Side by side */}
        <div
          className={cn(
            'flex w-full min-w-0 flex-col transition-transform duration-300 md:w-2/3',
            selectedConversationId ? 'flex' : 'hidden md:flex'
          )}
        >
          {selectedConversationId ? (
            <div className="relative flex h-full flex-col">
              {/* Mobile back button */}
              <button
                onClick={() => {
                  setSelectedConversationId(null);
                  setSelectedConversationTitle(undefined);
                }}
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
                {t('back', { defaultValue: 'Back' })}
              </button>
              <div className="min-h-0 flex-1">
                <UnifiedChatWindow
                  conversationId={selectedConversationId}
                  title={selectedConversationTitle}
                  isOpen={!!selectedConversationId}
                  onClose={() => {
                    setSelectedConversationId(null);
                    setSelectedConversationTitle(undefined);
                  }}
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
    </ProtectedRoute>
  );
}
