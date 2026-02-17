'use client';

import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';

import type { Message, ChatMessagesResponse } from '../services/chat.service';

import { useSocket, useOnSocketConnect } from './useSocket';

interface TypingUserInfo {
  firstName: string | null;
  lastName: string | null;
  provider?: {
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

  const chatId = visitId || conversationId;
  const listenersSetupRef = useRef<string | null>(null);
  const previousChatIdRef = useRef<string | null>(null);
  const socketRef = useRef(socket);
  const handlersRef = useRef<{
    handleNewMessage?: (message: Message) => void;
    handleTyping?: (data: {
      userId: string;
      visitId?: string;
      conversationId?: string;
      isTyping: boolean;
      userInfo?: { firstName: string | null; lastName: string | null };
      provider?: {
        companyName: string | null;
        firstName: string | null;
        lastName: string | null;
      } | null;
      teamMember?: { firstName: string | null; lastName: string | null; role: string } | null;
    }) => void;
    handleReactionUpdate?: (data: {
      messageId: string;
      reactions: Record<
        string,
        Array<{ id: string; firstName: string | null; lastName: string | null }>
      >;
    }) => void;
    handleMessagesRead?: (data: {
      visitId?: string;
      conversationId?: string;
      userId: string;
      readAt?: string;
    }) => void;
    handleUnreadCountUpdate?: (data: {
      visitId?: string;
      conversationId?: string;
      unreadCount: number;
    }) => void;
  }>({});

  // Keep socket ref up to date
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  // Update messages cache when new message arrives
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

  // Setup socket listeners
  const setupListeners = useCallback(() => {
    // Use socketRef.current to get the most up-to-date socket instance
    const currentSocket = socketRef.current || socket;

    if (!currentSocket || !chatId) {
      return;
    }

    if (!currentSocket.connected || !currentSocket.id) {
      return;
    }

    // Always clean up existing listeners first, even if we think they're already set up
    // This ensures we don't have duplicate listeners after hard reload
    const handlers = handlersRef.current;
    if (handlers.handleNewMessage) currentSocket.off('new-message', handlers.handleNewMessage);
    if (handlers.handleTyping) currentSocket.off('user-typing', handlers.handleTyping);
    if (handlers.handleReactionUpdate)
      currentSocket.off('reaction-updated', handlers.handleReactionUpdate);
    if (handlers.handleMessagesRead)
      currentSocket.off('messages-read', handlers.handleMessagesRead);
    if (handlers.handleUnreadCountUpdate)
      currentSocket.off('unread-count-updated', handlers.handleUnreadCountUpdate);

    // Check if listeners are already set up for this chatId
    if (listenersSetupRef.current === chatId) {
      return;
    }

    // Handler for typing indicators
    const handleTyping = (data: {
      userId: string;
      visitId?: string;
      conversationId?: string;
      isTyping: boolean;
      userInfo?: { firstName: string | null; lastName: string | null };
      provider?: {
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
            provider: data.provider || null,
            teamMember: data.teamMember || null,
          });
        } else {
          next.delete(data.userId);
        }
        return next;
      });
    };

    // Handler for new messages
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

    // Handler for reaction updates
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

    // Handler for read receipts
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

    // Handler for unread count updates
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

    // Store handlers
    handlersRef.current = {
      handleNewMessage,
      handleTyping,
      handleReactionUpdate,
      handleMessagesRead,
      handleUnreadCountUpdate,
    };

    // Register all event listeners
    currentSocket.on('new-message', handleNewMessage);
    currentSocket.on('user-typing', handleTyping);
    currentSocket.on('reaction-updated', handleReactionUpdate);
    currentSocket.on('messages-read', handleMessagesRead);
    currentSocket.on('unread-count-updated', handleUnreadCountUpdate);

    // Join the appropriate room
    if (visitId) {
      currentSocket.emit('join-visit', { visitId });
    } else if (conversationId) {
      currentSocket.emit('join-conversation', { conversationId });
    }

    listenersSetupRef.current = chatId;
  }, [chatId, visitId, conversationId, currentUserId, updateMessagesCache, queryClient, socket]);

  // Main effect - setup listeners when socket is connected and chatId is available
  // This follows the pattern from hogi project: setup listeners when both conditions are met
  useEffect(() => {
    if (!socket || !chatId) {
      listenersSetupRef.current = null;
      return;
    }

    // Only setup listeners when socket is actually connected
    if (isConnected && socket.connected && socket.id) {
      // Reset listenersSetupRef if it's the same chatId (allows re-setup after hard reload)
      if (listenersSetupRef.current === chatId) {
        listenersSetupRef.current = null;
      }

      // Setup listeners immediately
      setupListeners();
    }
  }, [isConnected, socket, chatId, setupListeners]);

  // Use socket connect callback - this is called immediately when socket connects
  // This follows the pattern from hogi project where setupListeners is called after socket connects
  const handleSocketConnect = useCallback(
    (connectedSocket: Socket) => {
      if (!chatId) {
        return;
      }

      if (connectedSocket.connected && connectedSocket.id && listenersSetupRef.current !== chatId) {
        // Reset listenersSetupRef if needed
        if (listenersSetupRef.current === chatId) {
          listenersSetupRef.current = null;
        }
        // Update socketRef to ensure it's current BEFORE calling setupListeners
        socketRef.current = connectedSocket;
        // Call setupListeners immediately - it will use socketRef.current
        setupListeners();
      }
    },
    [chatId, setupListeners]
  );

  useOnSocketConnect(handleSocketConnect);

  // Effect to handle chatId changes - when chatId changes and socket is already connected, setup listeners
  useEffect(() => {
    if (!socket || !chatId) {
      // If chatId becomes null, reset listenersSetupRef
      if (!chatId && listenersSetupRef.current) {
        listenersSetupRef.current = null;
        setTypingUsers(new Map());
      }
      previousChatIdRef.current = chatId;
      return;
    }

    const previousChatId = previousChatIdRef.current;

    // If chatId changed, clean up previous chat first
    if (previousChatId && previousChatId !== chatId && socket.connected) {
      // Leave previous chat room (we need to determine if it was visitId or conversationId)
      // Since we don't have that info, we'll just reset listenersSetupRef
      listenersSetupRef.current = null;
      setTypingUsers(new Map());
    }

    // Update previousChatIdRef
    previousChatIdRef.current = chatId;

    // If socket is already connected and listeners are not set up for this chatId, setup them
    // Also check isConnected to ensure we setup listeners when socket connects
    if ((isConnected || socket.connected) && socket.id && listenersSetupRef.current !== chatId) {
      setupListeners();
    }
  }, [chatId, socket, isConnected, setupListeners]);

  // Cleanup effect - remove listeners when chatId changes or component unmounts
  useEffect(() => {
    const previousChatId = previousChatIdRef.current;
    previousChatIdRef.current = chatId;

    return () => {
      if (!socket || !previousChatId) return;

      const handlers = handlersRef.current;
      if (handlers.handleNewMessage) socket.off('new-message', handlers.handleNewMessage);
      if (handlers.handleTyping) socket.off('user-typing', handlers.handleTyping);
      if (handlers.handleReactionUpdate)
        socket.off('reaction-updated', handlers.handleReactionUpdate);
      if (handlers.handleMessagesRead) socket.off('messages-read', handlers.handleMessagesRead);
      if (handlers.handleUnreadCountUpdate)
        socket.off('unread-count-updated', handlers.handleUnreadCountUpdate);

      // Leave the previous chat room
      // We need to determine if previousChatId was a visitId or conversationId
      // Since we don't have that info in cleanup, we'll leave both if needed
      // But actually, we should store the previous visitId/conversationId separately
      // For now, we'll just reset the listenersSetupRef

      // Reset listenersSetupRef when chatId changes or component unmounts
      if (listenersSetupRef.current === previousChatId) {
        listenersSetupRef.current = null;
      }
      setTypingUsers(new Map());
    };
  }, [socket, chatId, visitId, conversationId]);

  // Reset listenersSetupRef when socket disconnects
  useEffect(() => {
    if (!socket) {
      listenersSetupRef.current = null;
      return;
    }

    const handleDisconnect = () => {
      listenersSetupRef.current = null;
    };

    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket]);

  return { typingUsers, isConnected, socket };
}
