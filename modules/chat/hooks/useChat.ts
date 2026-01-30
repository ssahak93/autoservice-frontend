'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
  type InfiniteData,
} from '@tanstack/react-query';

import { useUIStore } from '@/stores/uiStore';

import {
  chatService,
  type Message,
  type SendMessageDto,
  type ChatMessagesResponse,
} from '../services/chat.service';

interface ChatMessagesOptions {
  limit?: number;
  realtimeEnabled?: boolean;
  pollIntervalMs?: number;
}

export function useChatMessages(visitId: string | null, options: ChatMessagesOptions = {}) {
  const limit = options.limit ?? 50;
  const realtimeEnabled = options.realtimeEnabled ?? true;
  const pollIntervalMs = options.pollIntervalMs ?? 5000;

  return useInfiniteQuery({
    queryKey: ['chat', 'messages', visitId, limit],
    queryFn: async ({ pageParam = 1 }) => {
      if (!visitId) {
        return { data: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } };
      }
      try {
        const result = await chatService.getMessages(visitId, pageParam, limit);
        return result;
      } catch (_error) {
        return { data: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } };
      }
    },
    getNextPageParam: (lastPageResult) => {
      if (lastPageResult.pagination.page < lastPageResult.pagination.totalPages) {
        return lastPageResult.pagination.page + 1;
      }
      return undefined;
    },
    getPreviousPageParam: () => {
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!visitId,
    staleTime: 30 * 1000,
    refetchInterval: realtimeEnabled ? false : pollIntervalMs,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: ({ visitId, dto }: { visitId: string; dto: SendMessageDto }) =>
      chatService.sendMessage(visitId, dto),
    onSuccess: (data, variables) => {
      queryClient.setQueriesData(
        {
          queryKey: ['chat', 'messages', variables.visitId],
          exact: false,
        },
        (old: InfiniteData<ChatMessagesResponse> | undefined) => {
          if (!old || !old.pages) {
            return {
              pages: [
                { data: [data], pagination: { page: 1, limit: 50, total: 1, totalPages: 1 } },
              ],
              pageParams: [1],
            };
          }

          const messageExists = old.pages.some((page) =>
            page.data?.some((m: Message) => m.id === data.id)
          );

          if (messageExists) {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data?.map((m: Message) => (m.id === data.id ? data : m)) || [],
              })),
            };
          }

          const newPages = [...old.pages];
          if (newPages[0]) {
            const existingMessages = newPages[0].data || [];
            newPages[0] = {
              ...newPages[0],
              data: [data, ...existingMessages],
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
        queryKey: ['chat', 'messages', variables.visitId],
        exact: false,
        refetchType: 'none',
      });
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to send message', 'error');
    },
  });
}

export function useSendImageMessage() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: ({ visitId, file, content }: { visitId: string; file: File; content?: string }) =>
      chatService.sendImageMessage(visitId, file, content),
    onSuccess: (data, variables) => {
      queryClient.setQueriesData(
        {
          queryKey: ['chat', 'messages', variables.visitId],
          exact: false,
        },
        (old: InfiniteData<ChatMessagesResponse> | undefined) => {
          if (!old || !old.pages) {
            return {
              pages: [
                { data: [data], pagination: { page: 1, limit: 50, total: 1, totalPages: 1 } },
              ],
              pageParams: [1],
            };
          }

          const messageExists = old.pages.some((page) =>
            page.data?.some((m: Message) => m.id === data.id)
          );

          if (messageExists) {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data?.map((m: Message) => (m.id === data.id ? data : m)) || [],
              })),
            };
          }

          const newPages = [...old.pages];
          if (newPages[0]) {
            const existingMessages = newPages[0].data || [];
            newPages[0] = {
              ...newPages[0],
              data: [data, ...existingMessages],
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
        queryKey: ['chat', 'messages', variables.visitId],
        exact: false,
        refetchType: 'none',
      });
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to send image', 'error');
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (visitId: string) => chatService.markAsRead(visitId),
    onSuccess: (_, visitId) => {
      queryClient.setQueryData(['chat', 'unread', visitId], 0);
    },
  });
}

export function useUnreadCount(visitId: string | null) {
  return useQuery({
    queryKey: ['chat', 'unread', visitId],
    queryFn: async () => {
      if (!visitId) return 0;
      try {
        return await chatService.getUnreadCount(visitId);
      } catch (_error) {
        return 0;
      }
    },
    enabled: !!visitId,
    staleTime: 30 * 1000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}

export function useAddReaction() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      chatService.addReaction(messageId, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages'] });
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to add reaction', 'error');
    },
  });
}

// Admin conversation hooks
export function useAdminConversationMessages(
  conversationId: string | null,
  options: ChatMessagesOptions = {}
) {
  const limit = options.limit ?? 50;
  const realtimeEnabled = options.realtimeEnabled ?? true;
  const pollIntervalMs = options.pollIntervalMs ?? 5000;
  const queryClient = useQueryClient();

  return useInfiniteQuery({
    queryKey: ['chat', 'admin', 'messages', conversationId, limit],
    queryFn: async ({ pageParam = 1 }) => {
      if (!conversationId) {
        return { data: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } };
      }
      try {
        const result = await chatService.getAdminConversationMessages(
          conversationId,
          pageParam,
          limit
        );

        // Mark messages as read when first page is loaded (user opened conversation)
        // This ensures messages are marked as read even after page reload
        if (pageParam === 1 && result.data && result.data.length > 0) {
          // Check if there are unread messages (messages not from current user)
          // Note: We can't check senderId here without user context, so we mark all unread messages
          const hasUnread = result.data.some((msg) => !msg.isRead);
          if (hasUnread) {
            // Mark as read in background (don't await to avoid blocking UI)
            chatService.markAdminMessagesAsRead(conversationId).catch((error) => {
              console.error('Failed to mark messages as read:', error);
            });
            // Optimistically update unread count
            queryClient.setQueryData(['chat', 'admin', 'unread', conversationId], 0);
            queryClient.invalidateQueries({ queryKey: ['admin', 'conversations'] });
          }
        }

        return result;
      } catch (_error) {
        return { data: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } };
      }
    },
    getNextPageParam: (lastPageResult) => {
      if (lastPageResult.pagination.page < lastPageResult.pagination.totalPages) {
        return lastPageResult.pagination.page + 1;
      }
      return undefined;
    },
    getPreviousPageParam: () => {
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!conversationId,
    staleTime: 30 * 1000,
    refetchInterval: realtimeEnabled ? false : pollIntervalMs,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}

export function useSendAdminConversationMessage() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      chatService.sendAdminConversationMessage(conversationId, content),
    onSuccess: (data, variables) => {
      queryClient.setQueriesData(
        {
          queryKey: ['chat', 'admin', 'messages', variables.conversationId],
          exact: false,
        },
        (old: InfiniteData<ChatMessagesResponse> | undefined) => {
          if (!old || !old.pages) {
            return {
              pages: [
                { data: [data], pagination: { page: 1, limit: 50, total: 1, totalPages: 1 } },
              ],
              pageParams: [1],
            };
          }

          const messageExists = old.pages.some((page) =>
            page.data?.some((m: Message) => m.id === data.id)
          );

          if (messageExists) {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data?.map((m: Message) => (m.id === data.id ? data : m)) || [],
              })),
            };
          }

          const newPages = [...old.pages];
          if (newPages[0]) {
            const existingMessages = newPages[0].data || [];
            newPages[0] = {
              ...newPages[0],
              data: [data, ...existingMessages],
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
        queryKey: ['chat', 'admin', 'messages', variables.conversationId],
        exact: false,
        refetchType: 'none',
      });
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to send message', 'error');
    },
  });
}

export function useSendAdminConversationImageMessage() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: ({
      conversationId,
      file,
      content,
    }: {
      conversationId: string;
      file: File;
      content?: string;
    }) => chatService.sendAdminConversationImageMessage(conversationId, file, content),
    onSuccess: (data, variables) => {
      queryClient.setQueriesData(
        {
          queryKey: ['chat', 'admin', 'messages', variables.conversationId],
          exact: false,
        },
        (old: InfiniteData<ChatMessagesResponse> | undefined) => {
          if (!old || !old.pages) {
            return {
              pages: [
                { data: [data], pagination: { page: 1, limit: 50, total: 1, totalPages: 1 } },
              ],
              pageParams: [1],
            };
          }

          const messageExists = old.pages.some((page) =>
            page.data?.some((m: Message) => m.id === data.id)
          );

          if (messageExists) {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data?.map((m: Message) => (m.id === data.id ? data : m)) || [],
              })),
            };
          }

          const newPages = [...old.pages];
          if (newPages[0]) {
            const existingMessages = newPages[0].data || [];
            newPages[0] = {
              ...newPages[0],
              data: [data, ...existingMessages],
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
        queryKey: ['chat', 'admin', 'messages', variables.conversationId],
        exact: false,
        refetchType: 'none',
      });
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to send image message', 'error');
    },
  });
}
