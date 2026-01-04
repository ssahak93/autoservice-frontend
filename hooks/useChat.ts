'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
  type InfiniteData,
} from '@tanstack/react-query';

import {
  chatService,
  type Message,
  type SendMessageDto,
  type ChatMessagesResponse,
} from '@/lib/services/chat.service';
import { useUIStore } from '@/stores/uiStore';

/**
 * Hook to get messages for a visit with infinite scrolling
 * Backend returns messages in reverse chronological order (newest first)
 * Page 1 = newest messages, Page 2 = older messages, etc.
 */
export function useChatMessages(visitId: string | null, limit: number = 50) {
  return useInfiniteQuery({
    queryKey: ['chat', 'messages', visitId, limit],
    queryFn: async ({ pageParam = 1 }) => {
      if (!visitId) {
        return { data: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } };
      }
      try {
        const result = await chatService.getMessages(visitId, pageParam, limit);
        return result;
      } catch (error) {
        return { data: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } };
      }
    },
    getNextPageParam: (lastPageResult) => {
      // Load next page (older messages) - page number increases
      if (lastPageResult.pagination.page < lastPageResult.pagination.totalPages) {
        return lastPageResult.pagination.page + 1;
      }
      return undefined;
    },
    getPreviousPageParam: () => {
      return undefined;
    },
    initialPageParam: 1, // Start from page 1 (newest messages)
    enabled: !!visitId,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchInterval: false, // Disable polling - WebSocket will handle real-time updates
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Will use cached data if fresh (within staleTime)
  });
}

/**
 * Hook to send a message
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: ({ visitId, dto }: { visitId: string; dto: SendMessageDto }) =>
      chatService.sendMessage(visitId, dto),
    onSuccess: (data, variables) => {
      // Update infinite query cache
      queryClient.setQueriesData(
        {
          queryKey: ['chat', 'messages', variables.visitId],
          exact: false,
        },
        (old: InfiniteData<ChatMessagesResponse> | undefined) => {
          if (!old || !old.pages) {
            // If no cache exists, create it
            return {
              pages: [
                { data: [data], pagination: { page: 1, limit: 50, total: 1, totalPages: 1 } },
              ],
              pageParams: [1],
            };
          }

          // Check if message already exists in any page
          const messageExists = old.pages.some((page) =>
            page.data?.some((m: Message) => m.id === data.id)
          );

          if (messageExists) {
            // Update existing message
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data?.map((m: Message) => (m.id === data.id ? data : m)) || [],
              })),
            };
          }

          // Add new message to the first page (most recent)
          const newPages = [...old.pages];
          if (newPages[0]) {
            newPages[0] = {
              ...newPages[0],
              data: [...(newPages[0].data || []), data],
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
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to send message', 'error');
    },
  });
}

/**
 * Hook to send an image message
 */
export function useSendImageMessage() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: ({ visitId, file, content }: { visitId: string; file: File; content?: string }) =>
      chatService.sendImageMessage(visitId, file, content),
    onSuccess: (data, variables) => {
      // Update infinite query cache
      queryClient.setQueriesData(
        {
          queryKey: ['chat', 'messages', variables.visitId],
          exact: false,
        },
        (old: InfiniteData<ChatMessagesResponse> | undefined) => {
          if (!old || !old.pages) {
            // If no cache exists, create it
            return {
              pages: [
                { data: [data], pagination: { page: 1, limit: 50, total: 1, totalPages: 1 } },
              ],
              pageParams: [1],
            };
          }

          // Check if message already exists in any page
          const messageExists = old.pages.some((page) =>
            page.data?.some((m: Message) => m.id === data.id)
          );

          if (messageExists) {
            // Update existing message
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data?.map((m: Message) => (m.id === data.id ? data : m)) || [],
              })),
            };
          }

          // Add new message to the first page (most recent)
          const newPages = [...old.pages];
          if (newPages[0]) {
            newPages[0] = {
              ...newPages[0],
              data: [...(newPages[0].data || []), data],
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
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to send image', 'error');
    },
  });
}

/**
 * Hook to mark messages as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (visitId: string) => chatService.markAsRead(visitId),
    onSuccess: (_, visitId) => {
      // Update unread count to 0
      queryClient.setQueryData(['chat', 'unread', visitId], 0);
      // Don't invalidate messages - they will be updated via WebSocket if needed
    },
  });
}

/**
 * Hook to get unread count
 */
export function useUnreadCount(visitId: string | null) {
  return useQuery({
    queryKey: ['chat', 'unread', visitId],
    queryFn: async () => {
      if (!visitId) return 0;
      try {
        return await chatService.getUnreadCount(visitId);
      } catch (error) {
        // If endpoint doesn't exist or fails, return 0 instead of undefined
        return 0;
      }
    },
    enabled: !!visitId,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds (prevents duplicate requests in StrictMode)
    refetchInterval: false, // Disable polling - WebSocket will handle real-time updates
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Will use cached data if fresh (within staleTime), preventing duplicate requests
  });
}

/**
 * Hook to add reaction to a message
 */
export function useAddReaction() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      chatService.addReaction(messageId, emoji),
    onSuccess: (_data, _variables) => {
      // Invalidate messages to get updated reactions
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages'] });
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to add reaction', 'error');
    },
  });
}
