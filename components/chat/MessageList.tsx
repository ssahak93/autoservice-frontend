'use client';

import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
// Import only needed functions from date-fns for tree shaking
import { format } from 'date-fns/format';
import { isSameDay } from 'date-fns/isSameDay';
import { isToday } from 'date-fns/isToday';
import { isYesterday } from 'date-fns/isYesterday';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useMemo, useState, useCallback } from 'react';

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
  const [typingUsers, setTypingUsers] = useState<
    Map<
      string,
      {
        firstName: string | null;
        lastName: string | null;
        autoService?: {
          companyName: string | null;
          firstName: string | null;
          lastName: string | null;
        } | null;
        teamMember?: { firstName: string | null; lastName: string | null; role: string } | null;
      }
    >
  >(new Map());
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
  // Use a ref to track if we've already set up listeners to avoid duplicates
  const listenersSetupRef = useRef(false);
  const currentVisitIdRef = useRef<string | null>(null);
  const setupListenersRef = useRef<(() => void) | null>(null);

  // Function to set up listeners and join room
  const setupListenersAndJoin = useCallback(() => {
    if (!socket || !visitId) {
      return;
    }

    // Wait for socket to be connected
    if (!socket.connected && !isConnected) {
      return;
    }

    // If visitId changed, reset the flag
    if (currentVisitIdRef.current !== visitId) {
      listenersSetupRef.current = false;
      currentVisitIdRef.current = visitId;
    }

    // Only set up listeners once per visitId
    if (listenersSetupRef.current && currentVisitIdRef.current === visitId) {
      return;
    }

    let isJoined = false;

    // Listen for new messages - set up listeners FIRST to avoid missing messages
    const handleNewMessage = (message: Message) => {
      // Update infinite query cache - match any query key that starts with ['chat', 'messages', visitId]
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
          // Backend returns messages in reverse chronological order (newest first)
          // So we add to the beginning of the array
          const newPages = [...old.pages];
          if (newPages[0]) {
            // Check if message should be at the beginning (newest) or end
            const existingMessages = newPages[0].data || [];
            const messageDate = new Date(message.createdAt);
            const firstMessageDate =
              existingMessages.length > 0 ? new Date(existingMessages[0].createdAt) : null;

            // If new message is newer than first message, add to beginning
            // Otherwise add to end (shouldn't happen, but safety check)
            const shouldAddToBeginning = !firstMessageDate || messageDate >= firstMessageDate;

            newPages[0] = {
              ...newPages[0],
              data: shouldAddToBeginning
                ? [message, ...existingMessages]
                : [...existingMessages, message],
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

      // Force a refetch to ensure UI updates - sometimes setQueriesData doesn't trigger re-render
      queryClient.invalidateQueries({
        queryKey: ['chat', 'messages', visitId],
        exact: false,
        refetchType: 'none', // Don't refetch, just invalidate to trigger re-render
      });

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
    const handleTyping = (data: {
      userId: string;
      visitId: string;
      isTyping: boolean;
      userInfo?: { firstName: string | null; lastName: string | null };
      autoService?: {
        companyName: string | null;
        firstName: string | null;
        lastName: string | null;
      } | null;
      teamMember?: { firstName: string | null; lastName: string | null; role: string } | null;
    }) => {
      if (data.visitId !== visitId || data.userId === user?.id) return; // Ignore own typing
      setTypingUsers((prev) => {
        const next = new Map(prev);
        if (data.isTyping) {
          // Use provided user info from backend (preferred), or try to get from recent messages
          let userInfo = data.userInfo || { firstName: null, lastName: null };
          let autoService = data.autoService || null;
          let teamMember = data.teamMember || null;

          // If backend didn't provide user info, try to get from recent messages
          if (!userInfo.firstName && !userInfo.lastName) {
            const userMessage = messages.find((m) => m.senderId === data.userId);
            if (userMessage?.sender) {
              userInfo = {
                firstName: userMessage.sender.firstName,
                lastName: userMessage.sender.lastName,
              };
            }
            if (!autoService && userMessage?.autoService) {
              autoService = userMessage.autoService;
            }
            if (!teamMember && userMessage?.teamMember) {
              teamMember = userMessage.teamMember;
            }
          }

          next.set(data.userId, {
            ...userInfo,
            autoService,
            teamMember,
          });
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

    // Set up event listeners BEFORE joining room to ensure we don't miss messages
    // Remove any existing listeners first to avoid duplicates
    socket.off('new-message', handleNewMessage);
    socket.off('user-typing', handleTyping);
    socket.off('reaction-updated', handleReactionUpdate);
    socket.off('messages-read', handleMessagesRead);

    // Now add the listeners
    socket.on('new-message', handleNewMessage);
    socket.on('user-typing', handleTyping);
    socket.on('reaction-updated', handleReactionUpdate);
    socket.on('messages-read', handleMessagesRead);

    // Mark listeners as set up
    listenersSetupRef.current = true;

    // Join visit room AFTER setting up listeners
    socket.emit('join-visit', { visitId }, (response: { success?: boolean; error?: string }) => {
      if (response?.success) {
        isJoined = true;
      } else {
        // Reset flag on error so we can retry
        listenersSetupRef.current = false;
      }
    });

    // Store cleanup function
    const cleanup = () => {
      listenersSetupRef.current = false;
      socket.off('new-message', handleNewMessage);
      socket.off('user-typing', handleTyping);
      socket.off('reaction-updated', handleReactionUpdate);
      socket.off('messages-read', handleMessagesRead);
      if (isJoined) {
        socket.emit('leave-visit', { visitId });
      }
    };

    return cleanup;
  }, [socket, isConnected, visitId, queryClient, user?.id, messages]);

  // Main useEffect to trigger setup when socket/visitId changes
  useEffect(() => {
    // Cleanup previous setup if exists
    if (setupListenersRef.current) {
      setupListenersRef.current();
      setupListenersRef.current = null;
    }

    // Try to setup immediately if socket is ready
    const cleanup = setupListenersAndJoin();
    if (cleanup) {
      setupListenersRef.current = cleanup;
    }

    // Also listen for connect event to retry setup
    if (socket && visitId) {
      const handleConnect = () => {
        // Cleanup previous setup
        if (setupListenersRef.current) {
          setupListenersRef.current();
          setupListenersRef.current = null;
        }
        listenersSetupRef.current = false; // Reset flag to allow re-setup
        const newCleanup = setupListenersAndJoin();
        if (newCleanup) {
          setupListenersRef.current = newCleanup;
        }
      };

      socket.on('connect', handleConnect);

      return () => {
        socket.off('connect', handleConnect);
        // Cleanup on unmount
        if (setupListenersRef.current) {
          setupListenersRef.current();
          setupListenersRef.current = null;
        }
      };
    }

    return () => {
      // Cleanup on unmount
      if (setupListenersRef.current) {
        setupListenersRef.current();
        setupListenersRef.current = null;
      }
    };
  }, [socket, isConnected, visitId, queryClient, user?.id, setupListenersAndJoin]);

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
            {Array.from(typingUsers.entries())
              .map(([_userId, userInfo], index, array) => {
                // Get display name
                let displayName = 'Someone';
                if (userInfo.autoService && userInfo.teamMember) {
                  // Team member typing
                  const serviceName =
                    userInfo.autoService.companyName ||
                    `${userInfo.autoService.firstName || ''} ${userInfo.autoService.lastName || ''}`.trim() ||
                    'Auto Service';
                  displayName = `${userInfo.teamMember.firstName || 'Team member'} (${serviceName})`;
                } else if (userInfo.autoService) {
                  // Auto service owner typing
                  displayName =
                    userInfo.autoService.companyName ||
                    `${userInfo.autoService.firstName || ''} ${userInfo.autoService.lastName || ''}`.trim() ||
                    'Auto Service';
                } else if (userInfo.firstName || userInfo.lastName) {
                  // Regular user typing
                  displayName =
                    `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() || 'User';
                }

                if (array.length === 1) {
                  return t('isTyping', {
                    name: displayName,
                    defaultValue: `${displayName} is typing...`,
                  });
                } else if (index === 0) {
                  return displayName;
                } else if (index === array.length - 1) {
                  return ` and ${displayName}`;
                } else {
                  return `, ${displayName}`;
                }
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
