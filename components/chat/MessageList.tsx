'use client';

import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useMemo, useState } from 'react';

import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useChatMessages, useMarkAsRead } from '@/hooks/useChat';
import { useSocket } from '@/hooks/useSocket';
import type { Message, ChatMessagesResponse } from '@/lib/services/chat.service';

import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  visitId: string | null;
}

interface GroupedMessage {
  message: Message;
  showAvatar: boolean;
  showName: boolean;
  isGrouped: boolean;
  dateSeparator?: string;
}

export function MessageList({ visitId }: MessageListProps) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, isInitialLoading } =
    useChatMessages(visitId);
  const markAsRead = useMarkAsRead();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null); // Ref for intersection observer
  const previousScrollHeightRef = useRef<number>(0); // To maintain scroll position during infinite load

  // Flatten messages from all pages
  // Backend returns messages in reverse chronological order (newest first)
  // Pages are loaded in order: page 1 (newest), page 2 (older), page 3 (older), etc.
  // We need to reverse the messages array to display in chronological order (oldest first)
  const messages = useMemo(() => {
    if (!data?.pages) return [];
    // Flatten all pages and reverse to get chronological order (oldest first)
    const allMessages = data.pages.flatMap((page) => page.data || []);
    return allMessages.reverse();
  }, [data?.pages]);

  const t = useTranslations('chat');
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const markAsReadTimeoutRef = useRef<NodeJS.Timeout>();
  const lastMarkedAsReadRef = useRef<number>(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const previousMessagesLengthRef = useRef<number>(0);

  // Group messages by sender and time
  const groupedMessages = useMemo(() => {
    if (messages.length === 0) return [];

    const grouped: GroupedMessage[] = [];
    const GROUP_TIME_THRESHOLD = 5 * 60 * 1000; // 5 minutes

    messages.forEach((message, index) => {
      const prevMessage = index > 0 ? messages[index - 1] : null;
      const messageDate = new Date(message.createdAt);
      const prevMessageDate = prevMessage ? new Date(prevMessage.createdAt) : null;

      // Check if we need a date separator
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

      // Determine if message should be grouped with previous
      const isGrouped =
        prevMessage &&
        prevMessage.senderId === message.senderId &&
        prevMessageDate &&
        messageDate.getTime() - prevMessageDate.getTime() < GROUP_TIME_THRESHOLD;

      // Show avatar and name if not grouped or if it's a new sender
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

  // WebSocket: Join visit room and listen for messages
  useEffect(() => {
    if (!socket || !isConnected || !visitId) return;

    let isJoined = false;

    // Join visit room
    socket.emit('join-visit', { visitId }, (response: { success?: boolean }) => {
      if (response?.success) {
        isJoined = true;
      }
    });

    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      // Update infinite query cache
      queryClient.setQueriesData(
        {
          queryKey: ['chat', 'messages', visitId],
          exact: false,
        },
        (old: InfiniteData<ChatMessagesResponse> | undefined) => {
          if (!old || !old.pages) {
            // If no cache exists, create it
            return {
              pages: [
                { data: [message], pagination: { page: 1, limit: 50, total: 1, totalPages: 1 } },
              ],
              pageParams: [1],
            };
          }

          // Check if message already exists in any page
          const messageExists = old.pages.some((page) =>
            page.data?.some((m: Message) => m.id === message.id)
          );

          if (messageExists) {
            // Update existing message
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data?.map((m: Message) => (m.id === message.id ? message : m)) || [],
              })),
            };
          }

          // Add new message to the first page (most recent)
          const newPages = [...old.pages];
          if (newPages[0]) {
            newPages[0] = {
              ...newPages[0],
              data: [...(newPages[0].data || []), message],
              pagination: {
                ...newPages[0].pagination,
                total: (newPages[0].pagination?.total || 0) + 1,
              },
            };
          }

          return {
            ...old,
            pages: newPages,
          };
        }
      );
      // Update unread count manually instead of invalidating
      queryClient.setQueryData(['chat', 'unread', visitId], (old: number = 0) => {
        // Only increment if message is from other user
        if (message.senderId !== user?.id) {
          return old + 1;
        }
        return old;
      });
    };

    // Listen for typing indicators
    const handleTyping = (data: { userId: string; visitId: string; isTyping: boolean }) => {
      if (data.visitId !== visitId || data.userId === user?.id) return; // Ignore own typing
      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (data.isTyping) {
          next.add(data.userId);
        } else {
          next.delete(data.userId);
        }
        return next;
      });
    };

    // Listen for reaction updates
    const handleReactionUpdate = (data: {
      messageId: string;
      emoji: string;
      action: 'added' | 'removed';
      reactions: Record<
        string,
        Array<{ id: string; firstName: string | null; lastName: string | null }>
      >;
    }) => {
      queryClient.setQueriesData(
        {
          queryKey: ['chat', 'messages', visitId],
          exact: false,
        },
        (old: InfiniteData<ChatMessagesResponse> | undefined) => {
          if (!old || !old.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data:
                page.data?.map((m: Message) =>
                  m.id === data.messageId
                    ? {
                        ...m,
                        reactions: Object.entries(data.reactions).flatMap(([emoji, users]) =>
                          users.map((user) => ({
                            id: user.id,
                            emoji,
                            userId: user.id,
                            user,
                          }))
                        ),
                      }
                    : m
                ) || [],
            })),
          };
        }
      );
    };

    // Listen for messages read updates
    const handleMessagesRead = (data: { visitId: string; userId: string; readAt?: string }) => {
      if (data.visitId !== visitId || data.userId === user?.id) return; // Only update if other user reads
      queryClient.setQueriesData(
        {
          queryKey: ['chat', 'messages', visitId],
          exact: false,
        },
        (old: InfiniteData<ChatMessagesResponse> | undefined) => {
          if (!old || !old.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data:
                page.data?.map((m: Message) =>
                  m.senderId === user?.id && !m.isRead
                    ? { ...m, isRead: true, readAt: data.readAt || new Date().toISOString() }
                    : m
                ) || [],
            })),
          };
        }
      );
      queryClient.setQueryData(['chat', 'unread', visitId], 0); // Clear unread count
    };

    socket.on('new-message', handleNewMessage);
    socket.on('user-typing', handleTyping);
    socket.on('reaction-updated', handleReactionUpdate);
    socket.on('messages-read', handleMessagesRead);

    return () => {
      if (isJoined) {
        socket.emit('leave-visit', { visitId });
      }
      socket.off('new-message', handleNewMessage);
      socket.off('user-typing', handleTyping);
      socket.off('reaction-updated', handleReactionUpdate);
      socket.off('messages-read', handleMessagesRead);
    };
  }, [socket, isConnected, visitId, queryClient, user?.id]);

  // Initial scroll to bottom when messages are loaded
  useEffect(() => {
    if (!isInitialLoading && messages.length > 0 && messagesContainerRef.current && isInitialLoad) {
      // On initial load, scroll to bottom instantly (no animation)
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      });
      setIsInitialLoad(false);
      previousMessagesLengthRef.current = messages.length;
    }
  }, [isInitialLoading, messages.length, isInitialLoad]);

  // Scroll to bottom when new message arrives and user is near bottom
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

  // Infinite scroll: Load older messages when scrolling to top
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          // Store current scroll position before fetching more
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

  // Adjust scroll position after loading more messages
  useEffect(() => {
    if (
      !isFetchingNextPage &&
      messagesContainerRef.current &&
      previousScrollHeightRef.current > 0
    ) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight;
      messagesContainerRef.current.scrollTop = newScrollHeight - previousScrollHeightRef.current;
      previousScrollHeightRef.current = 0; // Reset
    }
  }, [isFetchingNextPage, messages]);

  // Mark messages as read when component mounts or new unread messages arrive (with debounce and throttling)
  useEffect(() => {
    if (messages.length === 0) return;
    if (!user?.id) return;

    // Check if there are any unread messages from other users
    const unreadMessages = messages.filter(
      (msg: Message) => !msg.isRead && msg.senderId !== user.id
    );
    if (unreadMessages.length === 0) return;

    // Throttle: don't mark as read more than once per 3 seconds
    const now = Date.now();
    if (now - lastMarkedAsReadRef.current < 3000) {
      return;
    }

    // Clear existing timeout
    if (markAsReadTimeoutRef.current) {
      clearTimeout(markAsReadTimeoutRef.current);
    }

    // Debounce: wait 1.5 seconds after last message change before marking as read
    markAsReadTimeoutRef.current = setTimeout(() => {
      markAsRead.mutate(visitId, {
        onSuccess: () => {
          lastMarkedAsReadRef.current = Date.now();
        },
      });
    }, 1500);

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
    <div ref={messagesContainerRef} className="flex h-full flex-col overflow-y-auto px-4 py-4">
      {/* Loading indicator for older messages */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-2">
          <LoadingSpinner size="sm" />
        </div>
      )}
      {hasNextPage && <div ref={loadMoreRef} className="h-1" />}

      <AnimatePresence initial={false}>
        {groupedMessages.map((grouped, index) => (
          <div key={grouped.message.id}>
            {/* Date Separator */}
            {grouped.dateSeparator && (
              <div className="my-4 flex items-center justify-center">
                <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                  {grouped.dateSeparator}
                </div>
              </div>
            )}

            {/* Message */}
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

      {/* Typing Indicator */}
      {typingUsers.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="mb-2 flex items-center gap-2 px-1 text-sm text-neutral-500"
        >
          <div className="flex gap-1">
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-neutral-400"
              style={{ animationDelay: '0ms' }}
            />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-neutral-400"
              style={{ animationDelay: '150ms' }}
            />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-neutral-400"
              style={{ animationDelay: '300ms' }}
            />
          </div>
          <span>
            {typingUsers.size === 1
              ? t('isTyping', { defaultValue: 'Someone is typing...' })
              : t('areTyping', { defaultValue: 'People are typing...' })}
          </span>
        </motion.div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
