'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { chatService, type Message, type SendMessageDto } from '@/lib/services/chat.service';
import { useUIStore } from '@/stores/uiStore';

/**
 * Hook to get messages for a visit
 */
export function useChatMessages(visitId: string | null, page: number = 1, limit: number = 50) {
  return useQuery({
    queryKey: ['chat', 'messages', visitId, page, limit],
    queryFn: () => (visitId ? chatService.getMessages(visitId, page, limit) : null),
    enabled: !!visitId,
    refetchInterval: 5000, // Poll every 5 seconds (fallback if WebSocket fails)
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
      // Invalidate messages query
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', variables.visitId] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'unread', variables.visitId] });
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
    mutationFn: ({ visitId, file }: { visitId: string; file: File }) =>
      chatService.sendImageMessage(visitId, file),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', variables.visitId] });
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
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', visitId] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'unread', visitId] });
    },
  });
}

/**
 * Hook to get unread count
 */
export function useUnreadCount(visitId: string | null) {
  return useQuery({
    queryKey: ['chat', 'unread', visitId],
    queryFn: () => (visitId ? chatService.getUnreadCount(visitId) : 0),
    enabled: !!visitId,
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

/**
 * Hook to use WebSocket for real-time chat
 * Note: This is a placeholder. WebSocket implementation would require
 * additional setup with socket.io-client or similar library
 */
export function useChatWebSocket(visitId: string | null, onMessage: (message: Message) => void) {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!visitId) return;

    // TODO: Implement WebSocket connection
    // For now, we rely on polling (refetchInterval in useChatMessages)
    // WebSocket implementation would look like:
    // const ws = new WebSocket(`ws://localhost:3000/chat/visits/${visitId}`);
    // ws.onmessage = (event) => {
    //   const message = JSON.parse(event.data);
    //   onMessage(message);
    //   queryClient.setQueryData(['chat', 'messages', visitId], (old: any) => {
    //     return { ...old, data: [message, ...old.data] };
    //   });
    // };
    // wsRef.current = ws;

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [visitId, onMessage, queryClient]);
}

