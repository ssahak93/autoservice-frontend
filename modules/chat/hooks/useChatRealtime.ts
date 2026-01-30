'use client';

import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { Message, ChatMessagesResponse } from '../services/chat.service';

import { useSocket } from './useSocket';

interface TypingUserInfo {
  firstName: string | null;
  lastName: string | null;
  autoService?: {
    companyName: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null;
  teamMember?: { firstName: string | null; lastName: string | null; role: string } | null;
}

export function useChatRealtime(
  visitId: string | null,
  conversationId: string | null,
  currentUserId?: string | null
) {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUserInfo>>(new Map());
  const currentVisitIdRef = useRef<string | null>(null);
  const currentConversationIdRef = useRef<string | null>(null);
  const listenersSetupRef = useRef(false);

  const chatId = visitId || conversationId;

  const updateMessagesCache = useCallback(
    (message: Message) => {
      if (!chatId) return;
      if (visitId && message.visitId !== visitId) return;
      if (conversationId && message.conversationId !== conversationId) return;

      const queryKey = visitId
        ? ['chat', 'messages', visitId]
        : ['chat', 'admin', 'messages', conversationId];

      queryClient.setQueriesData(
        {
          queryKey,
          exact: false,
        },
        (old: InfiniteData<ChatMessagesResponse> | undefined) => {
          if (!old || !old.pages) {
            return {
              pages: [
                { data: [message], pagination: { page: 1, limit: 50, total: 1, totalPages: 1 } },
              ],
              pageParams: [1],
            };
          }

          const messageExists = old.pages.some((page) =>
            page.data?.some((m: Message) => m.id === message.id)
          );

          if (messageExists) {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data?.map((m: Message) => (m.id === message.id ? message : m)) || [],
              })),
            };
          }

          const newPages = [...old.pages];
          if (newPages[0]) {
            const existingMessages = newPages[0].data || [];
            newPages[0] = {
              ...newPages[0],
              data: [message, ...existingMessages],
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

      queryClient.invalidateQueries({
        queryKey,
        exact: false,
        refetchType: 'none',
      });
    },
    [queryClient, visitId, conversationId, chatId]
  );

  // handleUnreadCountUpdate is defined inside useEffect, so we don't need it here

  useEffect(() => {
    if (!socket || !chatId || !isConnected) {
      return;
    }

    if (
      (visitId && currentVisitIdRef.current !== visitId) ||
      (conversationId && currentConversationIdRef.current !== conversationId)
    ) {
      listenersSetupRef.current = false;
      if (visitId) currentVisitIdRef.current = visitId;
      if (conversationId) currentConversationIdRef.current = conversationId;
    }

    if (listenersSetupRef.current) {
      return;
    }

    const handleNewMessage = (message: Message) => {
      updateMessagesCache(message);
      const unreadKey = visitId
        ? ['chat', 'unread', visitId]
        : ['chat', 'admin', 'unread', conversationId];
      queryClient.setQueryData(unreadKey, (old: number = 0) => {
        if (message.senderId !== currentUserId) {
          return old + 1;
        }
        return old;
      });
    };

    const handleTyping = (data: {
      userId: string;
      visitId?: string;
      conversationId?: string;
      isTyping: boolean;
      userInfo?: { firstName: string | null; lastName: string | null };
      autoService?: {
        companyName: string | null;
        firstName: string | null;
        lastName: string | null;
      } | null;
      teamMember?: { firstName: string | null; lastName: string | null; role: string } | null;
    }) => {
      if (visitId && data.visitId !== visitId) return;
      if (conversationId && data.conversationId !== conversationId) return;
      if (data.userId === currentUserId) return;

      setTypingUsers((prev) => {
        const next = new Map(prev);
        if (data.isTyping) {
          next.set(data.userId, {
            firstName: data.userInfo?.firstName ?? null,
            lastName: data.userInfo?.lastName ?? null,
            autoService: data.autoService || null,
            teamMember: data.teamMember || null,
          });
        } else {
          next.delete(data.userId);
        }
        return next;
      });
    };

    const handleReactionUpdate = (data: {
      messageId: string;
      reactions: Record<
        string,
        Array<{ id: string; firstName: string | null; lastName: string | null }>
      >;
    }) => {
      const queryKey = visitId
        ? ['chat', 'messages', visitId]
        : ['chat', 'admin', 'messages', conversationId];
      queryClient.setQueriesData(
        {
          queryKey,
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

    const handleMessagesRead = (data: {
      visitId?: string;
      conversationId?: string;
      userId: string;
      readAt?: string;
    }) => {
      if (visitId && data.visitId !== visitId) return;
      if (conversationId && data.conversationId !== conversationId) return;
      if (data.userId === currentUserId) return;

      const queryKey = visitId
        ? ['chat', 'messages', visitId]
        : ['chat', 'admin', 'messages', conversationId];
      queryClient.setQueriesData(
        {
          queryKey,
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
                  m.senderId === currentUserId && !m.isRead
                    ? { ...m, isRead: true, readAt: data.readAt || new Date().toISOString() }
                    : m
                ) || [],
            })),
          };
        }
      );
      const unreadKey = visitId
        ? ['chat', 'unread', visitId]
        : ['chat', 'admin', 'unread', conversationId];
      queryClient.setQueryData(unreadKey, 0);
    };

    const handleUnreadCountUpdate = (data: {
      visitId?: string;
      conversationId?: string;
      unreadCount: number;
    }) => {
      if (visitId && data.visitId === visitId) {
        queryClient.setQueryData(['chat', 'unread', visitId], data.unreadCount);
      } else if (conversationId && data.conversationId === conversationId) {
        queryClient.setQueryData(['chat', 'admin', 'unread', conversationId], data.unreadCount);
      }
    };

    socket.on('new-message', handleNewMessage);
    socket.on('user-typing', handleTyping);
    socket.on('reaction-updated', handleReactionUpdate);
    socket.on('messages-read', handleMessagesRead);
    socket.on('unread-count-updated', handleUnreadCountUpdate);

    listenersSetupRef.current = true;

    if (visitId) {
      socket.emit('join-visit', { visitId });
    } else if (conversationId) {
      socket.emit('join-conversation', { conversationId });
    }

    return () => {
      listenersSetupRef.current = false;
      socket.off('new-message', handleNewMessage);
      socket.off('user-typing', handleTyping);
      socket.off('reaction-updated', handleReactionUpdate);
      socket.off('messages-read', handleMessagesRead);
      socket.off('unread-count-updated', handleUnreadCountUpdate);
      if (visitId) {
        socket.emit('leave-visit', { visitId });
      } else if (conversationId) {
        socket.emit('leave-conversation', { conversationId });
      }
      setTypingUsers(new Map());
    };
  }, [
    socket,
    isConnected,
    visitId,
    conversationId,
    chatId,
    currentUserId,
    updateMessagesCache,
    queryClient,
  ]);

  return { typingUsers, isConnected, socket };
}
