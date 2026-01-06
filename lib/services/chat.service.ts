import type { AxiosError } from 'axios';

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export interface MessageReaction {
  id: string;
  emoji: string;
  userId: string;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export interface Message {
  id: string;
  visitId: string;
  senderId: string;
  autoServiceId?: string | null;
  teamMemberId?: string | null;
  content: string;
  messageType: 'text' | 'image' | 'sticker';
  imageFileId?: string;
  stickerId?: string;
  imageFile?: {
    fileUrl: string;
  };
  reactions?: MessageReaction[];
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarFile?: {
      fileUrl: string;
    };
  };
  autoService?: {
    id: string;
    serviceType: string;
    companyName: string | null;
    firstName: string | null;
    lastName: string | null;
    avatarFile?: {
      fileUrl: string;
    } | null;
  } | null;
  teamMember?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    avatarFile?: {
      fileUrl: string;
    } | null;
  } | null;
}

export interface SendMessageDto {
  content: string;
  messageType?: 'text' | 'image' | 'sticker';
  imageFileId?: string;
  stickerId?: string;
}

export interface ChatMessagesResponse {
  data: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const chatService = {
  /**
   * Get messages for a visit
   */
  async getMessages(
    visitId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<ChatMessagesResponse> {
    const response = await apiClient.get<ChatMessagesResponse>(`/chat/visits/${visitId}/messages`, {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Send a text message
   */
  async sendMessage(visitId: string, dto: SendMessageDto): Promise<Message> {
    try {
      const response = await apiClient.post<Message>(`/chat/visits/${visitId}/messages`, dto);
      return response.data;
    } catch (error) {
      // Extract error message from backend response
      const axiosError = error as AxiosError<{ message?: string; error?: { message?: string } }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error?.message ||
        axiosError.message ||
        'Failed to send message';
      throw new Error(errorMessage);
    }
  },

  /**
   * Send an image message with optional text content
   */
  async sendImageMessage(visitId: string, file: File, content?: string): Promise<Message> {
    const formData = new FormData();
    formData.append('file', file);
    if (content) {
      formData.append('content', content);
    }

    try {
      const response = await apiClient.post<Message>(
        `/chat/visits/${visitId}/messages/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      // Extract error message from backend response
      const axiosError = error as AxiosError<{ message?: string; error?: { message?: string } }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error?.message ||
        axiosError.message ||
        'Failed to send image message';
      throw new Error(errorMessage);
    }
  },

  async markAsRead(visitId: string): Promise<void> {
    await apiClient.put(`/chat/visits/${visitId}/messages/read`);
  },

  /**
   * Get unread message count
   */
  async getUnreadCount(visitId: string): Promise<number> {
    try {
      const response = await apiClient.get<{ count: number }>(
        `/chat/visits/${visitId}/unread-count`
      );
      return response.data.count || 0;
    } catch (error) {
      // If endpoint doesn't exist (404) or fails, return 0
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        return 0;
      }
      throw error;
    }
  },

  /**
   * Add or remove reaction to a message
   */
  async addReaction(
    messageId: string,
    emoji: string
  ): Promise<{ success: boolean; action: 'added' | 'removed' }> {
    const response = await apiClient.post<{ success: boolean; action: 'added' | 'removed' }>(
      `/chat/visits/messages/${messageId}/reactions`,
      { emoji }
    );
    return response.data;
  },

  /**
   * Get reactions for a message
   */
  async getReactions(
    messageId: string
  ): Promise<
    Record<string, Array<{ id: string; firstName: string | null; lastName: string | null }>>
  > {
    const response = await apiClient.get<
      Record<string, Array<{ id: string; firstName: string | null; lastName: string | null }>>
    >(`/chat/visits/messages/${messageId}/reactions`);
    return response.data;
  },

  /**
   * Get all conversations for auto service
   */
  async getConversations(autoServiceId?: string): Promise<{
    data: Array<{
      visitId: string;
      visit: {
        id: string;
        scheduledDate: string;
        scheduledTime: string;
        status: string;
      };
      customer: {
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
      };
      lastMessage: {
        id: string;
        content: string;
        createdAt: string;
        senderId: string;
      } | null;
      unreadCount: number;
    }>;
  }> {
    const response = await apiClient.get<{
      data: Array<{
        visitId: string;
        visit: {
          id: string;
          scheduledDate: string;
          scheduledTime: string;
          status: string;
        };
        customer: {
          id: string;
          firstName: string;
          lastName: string;
          avatarUrl: string | null;
        };
        lastMessage: {
          id: string;
          content: string;
          createdAt: string;
          senderId: string;
        } | null;
        unreadCount: number;
      }>;
    }>(API_ENDPOINTS.CHAT.CONVERSATIONS, {
      params: autoServiceId ? { autoServiceId } : undefined,
    });
    return response.data;
  },
};
