'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MessageSquare, Plus } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';

import { cn } from '@/lib/utils/cn';
import { formatDateShort } from '@/lib/utils/date';
import { useUIStore } from '@/stores/uiStore';

import { useSocket } from '../hooks/useSocket';
import { chatService, type AdminConversation } from '../services/chat.service';

interface AdminConversationsListProps {
  onConversationSelect?: (conversationId: string, title?: string) => void;
  selectedConversationId?: string | null;
}

export function AdminConversationsList({
  onConversationSelect,
  selectedConversationId,
}: AdminConversationsListProps = {}) {
  const t = useTranslations('chat');
  const locale = useLocale();
  const { showToast } = useUIStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState('');
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocket();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'conversations'],
    queryFn: () => chatService.getAdminConversations(),
  });

  // Listen for unread count updates via WebSocket
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleUnreadCountUpdate = (data: { conversationId: string; unreadCount: number }) => {
      // Update the conversation in the cache
      queryClient.setQueryData<{ data: AdminConversation[] }>(['admin', 'conversations'], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((conv) =>
            conv.id === data.conversationId ? { ...conv, unreadCount: data.unreadCount } : conv
          ),
        };
      });
    };

    socket.on('unread-count-updated', handleUnreadCountUpdate);

    return () => {
      socket.off('unread-count-updated', handleUnreadCountUpdate);
    };
  }, [socket, isConnected, queryClient]);

  const createMutation = useMutation({
    mutationFn: (title: string) => chatService.createAdminConversation(title),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'conversations'] });
      setShowCreateModal(false);
      setNewConversationTitle('');
      if (onConversationSelect) {
        onConversationSelect(conversation.id, conversation.title);
      }
      showToast(t('conversationCreated', { defaultValue: 'Conversation created' }), 'success');
    },
    onError: (error: Error) => {
      showToast(
        error.message || t('failedToCreate', { defaultValue: 'Failed to create conversation' }),
        'error'
      );
    },
  });

  const handleCreate = () => {
    if (!newConversationTitle.trim()) {
      showToast(t('titleRequired', { defaultValue: 'Title is required' }), 'error');
      return;
    }
    createMutation.mutate(newConversationTitle.trim());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-gray-500">{t('loading', { defaultValue: 'Loading...' })}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('supportChat', { defaultValue: 'Support Chat' })}
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-primary-700 hover:shadow-md active:scale-95"
        >
          <Plus className="h-4 w-4" />
          {t('newConversation', { defaultValue: 'New' })}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!data?.data || data.data.length === 0 ? (
          <div className="flex h-full items-center justify-center p-4">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                {t('noConversations', { defaultValue: 'No conversations yet' })}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {data.data.map((conversation) => {
              const isSelected = selectedConversationId === conversation.id;
              return (
                <motion.button
                  key={conversation.id}
                  onClick={async () => {
                    if (onConversationSelect) {
                      onConversationSelect(conversation.id, conversation.title);
                    }

                    // Mark messages as read when conversation is opened
                    if (conversation.unreadCount > 0) {
                      try {
                        await chatService.markAdminMessagesAsRead(conversation.id);
                        // Update unread count to 0 in cache
                        queryClient.setQueryData<{ data: AdminConversation[] }>(
                          ['admin', 'conversations'],
                          (old) => {
                            if (!old?.data) return old;
                            return {
                              ...old,
                              data: old.data.map((conv) =>
                                conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
                              ),
                            };
                          }
                        );
                        // Also update unread count query
                        queryClient.setQueryData(['chat', 'admin', 'unread', conversation.id], 0);
                      } catch (error) {
                        // Silently fail - WebSocket will handle it if available
                        console.error('Failed to mark messages as read:', error);
                      }
                    }
                  }}
                  className={cn(
                    'group relative w-full rounded-xl p-4 text-left transition-all',
                    'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                    'border border-transparent',
                    isSelected
                      ? 'border-primary-200 bg-primary-50 shadow-md ring-2 ring-primary-500/20 dark:border-primary-800 dark:bg-primary-900/20 dark:ring-primary-400/20'
                      : 'bg-white hover:border-gray-200 dark:bg-gray-800/30 dark:hover:border-gray-700'
                  )}
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3
                          className={cn(
                            'truncate font-semibold',
                            isSelected
                              ? 'text-primary-700 dark:text-primary-300'
                              : 'text-gray-900 dark:text-gray-100'
                          )}
                        >
                          {conversation.title}
                        </h3>
                      </div>
                      {conversation.lastMessage && (
                        <p
                          className={cn(
                            'mt-1 line-clamp-1 text-sm',
                            isSelected
                              ? 'text-primary-600 dark:text-primary-400'
                              : 'text-gray-500 dark:text-gray-400'
                          )}
                        >
                          {conversation.lastMessage.content}
                        </p>
                      )}
                      <p
                        className={cn(
                          'mt-1 text-xs',
                          isSelected
                            ? 'text-primary-500 dark:text-primary-400'
                            : 'text-gray-400 dark:text-gray-500'
                        )}
                      >
                        {formatDateShort(conversation.updatedAt, locale)}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary-600 px-2 text-xs font-semibold text-white shadow-lg ring-2 ring-primary-200 dark:bg-primary-500 dark:ring-primary-800"
                      >
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </motion.span>
                    )}
                  </div>
                  {isSelected && (
                    <motion.div
                      layoutId="selectedChat"
                      className="absolute left-0 top-0 h-full w-1 rounded-l-lg bg-primary-600 dark:bg-primary-400"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => {
            setShowCreateModal(false);
            setNewConversationTitle('');
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {t('createConversation', { defaultValue: 'Create Conversation' })}
            </h3>
            <input
              type="text"
              value={newConversationTitle}
              onChange={(e) => setNewConversationTitle(e.target.value)}
              placeholder={t('conversationTitle', { defaultValue: 'Conversation title' })}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-primary-800"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreate();
                }
              }}
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="flex-1 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-700 hover:shadow-md active:scale-95 disabled:opacity-50"
              >
                {createMutation.isPending
                  ? t('creating', { defaultValue: 'Creating...' })
                  : t('create', { defaultValue: 'Create' })}
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewConversationTitle('');
                }}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 active:scale-95 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                {t('cancel', { defaultValue: 'Cancel' })}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
