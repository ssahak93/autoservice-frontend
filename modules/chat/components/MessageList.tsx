'use client';

import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns/format';
import { isSameDay } from 'date-fns/isSameDay';
import { isToday } from 'date-fns/isToday';
import { isYesterday } from 'date-fns/isYesterday';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';

import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';

import { useChatMessages, useAdminConversationMessages, useMarkAsRead } from '../hooks/useChat';
import { useChatRealtime } from '../hooks/useChatRealtime';
import type { Message } from '../services/chat.service';

import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  visitId?: string | null;
  conversationId?: string | null;
}

interface GroupedMessage {
  message: Message;
  showAvatar: boolean;
  showName: boolean;
  isGrouped: boolean;
  dateSeparator?: string;
}

export function MessageList({ visitId, conversationId }: MessageListProps) {
  const { user } = useAuth();
  const { typingUsers, isConnected, socket } = useChatRealtime(
    visitId || null,
    conversationId || null,
    user?.id
  );

  // Use appropriate hook based on chat type
  const visitMessages = useChatMessages(visitId || null, { realtimeEnabled: isConnected });
  const adminMessages = useAdminConversationMessages(conversationId || null, {
    realtimeEnabled: isConnected,
  });

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, isInitialLoading } =
    visitId ? visitMessages : adminMessages;
  const markAsRead = useMarkAsRead();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const previousScrollHeightRef = useRef<number>(0);

  const messages = useMemo(() => {
    if (!data?.pages) return [];
    // Messages come from backend sorted by createdAt DESC (newest first)
    // We need to reverse to show oldest first (at top), newest last (at bottom)
    const allMessages = data.pages.flatMap((page) => page.data || []);
    // Sort by createdAt ascending (oldest first)
    return allMessages.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [data?.pages]);

  const t = useTranslations('chat');
  const markAsReadTimeoutRef = useRef<NodeJS.Timeout>();
  const lastMarkedAsReadRef = useRef<number>(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const previousMessagesLengthRef = useRef<number>(0);

  const groupedMessages = useMemo(() => {
    if (messages.length === 0) return [];

    const grouped: GroupedMessage[] = [];
    const GROUP_TIME_THRESHOLD = 5 * 60 * 1000;

    messages.forEach((message, index) => {
      const prevMessage = index > 0 ? messages[index - 1] : null;
      const messageDate = new Date(message.createdAt);
      const prevMessageDate = prevMessage ? new Date(prevMessage.createdAt) : null;

      let dateSeparator: string | undefined;
      if (!prevMessage || (prevMessageDate && !isSameDay(messageDate, prevMessageDate))) {
        if (isToday(messageDate)) {
          dateSeparator = t('today', { defaultValue: 'Today' });
        } else if (isYesterday(messageDate)) {
          dateSeparator = t('yesterday', { defaultValue: 'Yesterday' });
        } else {
          dateSeparator = format(messageDate, 'dd MMMM yyyy');
        }
      }

      const isGrouped =
        prevMessage &&
        prevMessage.senderId === message.senderId &&
        prevMessageDate &&
        messageDate.getTime() - prevMessageDate.getTime() < GROUP_TIME_THRESHOLD;

      const showAvatar = !isGrouped || !prevMessage || prevMessage.senderId !== message.senderId;
      const showName = !isGrouped && message.senderId !== user?.id;

      grouped.push({
        message,
        showAvatar,
        showName,
        isGrouped: !!isGrouped,
        dateSeparator,
      });
    });

    return grouped;
  }, [messages, user?.id, t]);

  useEffect(() => {
    if (!isInitialLoading && messages.length > 0 && messagesContainerRef.current && isInitialLoad) {
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      });
      setIsInitialLoad(false);
      previousMessagesLengthRef.current = messages.length;
    }
  }, [isInitialLoading, messages.length, isInitialLoad]);

  useEffect(() => {
    const hasNewMessage = messages.length > previousMessagesLengthRef.current;
    previousMessagesLengthRef.current = messages.length;

    if (hasNewMessage && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;

      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  // Mark as read for support conversations (WebSocket + HTTP fallback)
  useEffect(() => {
    if (conversationId && messages.length > 0 && user?.id) {
      const unreadMessages = messages.filter(
        (msg: Message) => !msg.isRead && msg.senderId !== user.id
      );
      if (unreadMessages.length === 0) return;

      const now = Date.now();
      if (now - lastMarkedAsReadRef.current < 2000) {
        return;
      }

      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
      }

      markAsReadTimeoutRef.current = setTimeout(async () => {
        // Try WebSocket first, fallback to HTTP
        if (socket && isConnected) {
          socket.emit(
            'mark-conversation-read',
            { conversationId },
            (response: { success?: boolean; error?: string }) => {
              if (response.success) {
                lastMarkedAsReadRef.current = Date.now();
                queryClient.invalidateQueries({ queryKey: ['admin', 'conversations'] });
                queryClient.setQueryData(['chat', 'admin', 'unread', conversationId], 0);
              } else {
                // Fallback to HTTP if WebSocket fails
                markAsReadViaHttp();
              }
            }
          );
        } else {
          // Use HTTP if WebSocket is not available
          markAsReadViaHttp();
        }
      }, 1000);

      const markAsReadViaHttp = async () => {
        try {
          const { chatService } = await import('../services/chat.service');
          await chatService.markAdminMessagesAsRead(conversationId);
          lastMarkedAsReadRef.current = Date.now();
          queryClient.invalidateQueries({ queryKey: ['admin', 'conversations'] });
          queryClient.setQueryData(['chat', 'admin', 'unread', conversationId], 0);
        } catch (error) {
          console.error('Failed to mark messages as read:', error);
        }
      };

      return () => {
        if (markAsReadTimeoutRef.current) {
          clearTimeout(markAsReadTimeoutRef.current);
        }
      };
    }
  }, [conversationId, messages, user?.id, socket, isConnected, queryClient]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          if (messagesContainerRef.current) {
            previousScrollHeightRef.current =
              messagesContainerRef.current.scrollHeight - messagesContainerRef.current.scrollTop;
          }
          fetchNextPage();
        }
      },
      { root: messagesContainerRef.current, threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    const currentRef = loadMoreRef.current;
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (
      !isFetchingNextPage &&
      messagesContainerRef.current &&
      previousScrollHeightRef.current > 0
    ) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight;
      messagesContainerRef.current.scrollTop = newScrollHeight - previousScrollHeightRef.current;
      previousScrollHeightRef.current = 0;
    }
  }, [isFetchingNextPage, messages]);

  useEffect(() => {
    if (messages.length === 0) return;
    if (!user?.id) return;

    const unreadMessages = messages.filter(
      (msg: Message) => !msg.isRead && msg.senderId !== user.id
    );
    if (unreadMessages.length === 0) return;

    const now = Date.now();
    if (now - lastMarkedAsReadRef.current < 3000) {
      return;
    }

    if (markAsReadTimeoutRef.current) {
      clearTimeout(markAsReadTimeoutRef.current);
    }

    if (visitId) {
      markAsReadTimeoutRef.current = setTimeout(() => {
        markAsRead.mutate(visitId, {
          onSuccess: () => {
            lastMarkedAsReadRef.current = Date.now();
          },
        });
      }, 1500);
    }

    return () => {
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
      }
    };
  }, [visitId, messages, user?.id, markAsRead]);

  if (isLoading && isInitialLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          title={t('noMessages', { defaultValue: 'No messages yet' })}
          description={t('startConversation', {
            defaultValue: 'Start the conversation by sending a message',
          })}
        />
      </div>
    );
  }

  return (
    <div
      ref={messagesContainerRef}
      className="flex h-full flex-col overflow-y-auto bg-gray-50 px-4 py-4 dark:bg-gray-900/50"
    >
      {isFetchingNextPage && (
        <div className="flex justify-center py-2">
          <LoadingSpinner size="sm" />
        </div>
      )}
      {hasNextPage && <div ref={loadMoreRef} className="h-1" />}

      <AnimatePresence initial={false}>
        {groupedMessages.map((grouped, index) => (
          <div key={grouped.message.id}>
            {grouped.dateSeparator && (
              <div className="my-4 flex items-center justify-center">
                <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                  {grouped.dateSeparator}
                </div>
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
            >
              <MessageBubble
                message={grouped.message}
                showAvatar={grouped.showAvatar}
                showName={grouped.showName}
                isGrouped={grouped.isGrouped}
              />
            </motion.div>
          </div>
        ))}
      </AnimatePresence>

      {typingUsers.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="mb-3 flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600 dark:bg-neutral-800"
        >
          <div className="flex gap-1">
            <div
              className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary-500"
              style={{ animationDelay: '0ms' }}
            />
            <div
              className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary-500"
              style={{ animationDelay: '150ms' }}
            />
            <div
              className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary-500"
              style={{ animationDelay: '300ms' }}
            />
          </div>
          <span className="font-medium">
            {Array.from(typingUsers.entries())
              .map(([_userId, userInfo], index, array) => {
                let displayName = 'Someone';
                if (userInfo.autoService && userInfo.teamMember) {
                  const serviceName =
                    userInfo.autoService.companyName ||
                    `${userInfo.autoService.firstName || ''} ${userInfo.autoService.lastName || ''}`.trim() ||
                    'Auto Service';
                  displayName = `${userInfo.teamMember.firstName || 'Team member'} (${serviceName})`;
                } else if (userInfo.autoService) {
                  displayName =
                    userInfo.autoService.companyName ||
                    `${userInfo.autoService.firstName || ''} ${userInfo.autoService.lastName || ''}`.trim() ||
                    'Auto Service';
                } else if (userInfo.firstName || userInfo.lastName) {
                  displayName =
                    `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() || 'User';
                }

                if (array.length === 1) {
                  return t('isTyping', {
                    name: displayName,
                    defaultValue: `${displayName} is typing...`,
                  });
                }
                if (index === 0) {
                  return displayName;
                }
                if (index === array.length - 1) {
                  return ` and ${displayName}`;
                }
                return `, ${displayName}`;
              })
              .join('')}
            {typingUsers.size > 1 && ` ${t('areTyping', { defaultValue: 'are typing...' })}`}
          </span>
        </motion.div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
