import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { unwrapResponseData, extractErrorMessage, isErrorStatus } from '@/lib/utils/api-response';

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
  visitId?: string | null;
  conversationId?: string | null;
  senderId: string;
  providerId?: string | null;
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
    firstName: string | null;
    lastName: string | null;
    avatarFile?: {
      fileUrl: string;
    } | null;
  };
  provider?: {
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

export interface AdminConversation {
  id: string;
  title: string;
  admin?: {
    id: string;
    email: string;
  };
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    senderType: string;
    isRead: boolean;
  } | null;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
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
    const response = await apiClient.get<
      ChatMessagesResponse | { success: boolean; data: ChatMessagesResponse }
    >(`/chat/visits/${visitId}/messages`, {
      params: { page, limit },
    });
    return unwrapResponseData(response);
  },

  /**
   * Send a text message
   */
  async sendMessage(visitId: string, dto: SendMessageDto): Promise<Message> {
    try {
      const response = await apiClient.post<Message | { success: boolean; data: Message }>(
        `/chat/visits/${visitId}/messages`,
        dto
      );
      return unwrapResponseData(response);
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Failed to send message');
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
      const response = await apiClient.post<Message | { success: boolean; data: Message }>(
        `/chat/visits/${visitId}/messages/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return unwrapResponseData(response);
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Failed to send image message');
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
      const response = await apiClient.get<
        { count: number } | { success: boolean; data: { count: number } }
      >(`/chat/visits/${visitId}/unread-count`);
      const data = unwrapResponseData(response);
      return data.count || 0;
    } catch (error) {
      if (isErrorStatus(error, 404)) {
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
    const response = await apiClient.post<
      | { success: boolean; action: 'added' | 'removed' }
      | { success: boolean; data: { success: boolean; action: 'added' | 'removed' } }
    >(`/chat/visits/messages/${messageId}/reactions`, { emoji });
    return unwrapResponseData(response);
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
      | Record<string, Array<{ id: string; firstName: string | null; lastName: string | null }>>
      | {
          success: boolean;
          data: Record<
            string,
            Array<{ id: string; firstName: string | null; lastName: string | null }>
          >;
        }
    >(`/chat/visits/messages/${messageId}/reactions`);
    return unwrapResponseData(response);
  },

  /**
   * Get all conversations for auto service
   */
  async getConversations(providerId?: string): Promise<{
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
    const response = await apiClient.get<
      | {
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
        }
      | {
          success: boolean;
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
        }
    >(API_ENDPOINTS.CHAT.CONVERSATIONS, {
      params: providerId ? { providerId } : undefined,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = unwrapResponseData(response as any) as
      | {
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
        }
      | Array<{
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
    // Handle both array and { data: array } formats
    return Array.isArray(data) ? { data } : data;
  },

  // Admin conversation methods
  /**
   * Get user conversations with admin
   */
  async getAdminConversations(): Promise<{ data: AdminConversation[] }> {
    const response = await apiClient.get<
      | { data: AdminConversation[] }
      | { success: boolean; data: { data: AdminConversation[] } }
      | AdminConversation[]
    >('/chat/admin/conversations');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = unwrapResponseData(response as any) as
      | { data: AdminConversation[] }
      | AdminConversation[];
    return Array.isArray(data) ? { data } : data;
  },

  /**
   * Create a new conversation with admin
   */
  async createAdminConversation(title: string): Promise<AdminConversation> {
    const response = await apiClient.post<
      AdminConversation | { success: boolean; data: AdminConversation }
    >('/chat/admin/conversations', {
      title,
    });
    return unwrapResponseData(response);
  },

  /**
   * Get messages for an admin conversation
   */
  async getAdminConversationMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<ChatMessagesResponse> {
    const response = await apiClient.get<
      ChatMessagesResponse | { success: boolean; data: ChatMessagesResponse }
    >(`/chat/admin/conversations/${conversationId}/messages`, {
      params: { page, limit },
    });
    return unwrapResponseData(response);
  },

  /**
   * Send a message in an admin conversation
   */
  async sendAdminConversationMessage(
    conversationId: string,
    content: string,
    imageFileId?: string
  ): Promise<Message> {
    try {
      const response = await apiClient.post<Message | { success: boolean; data: Message }>(
        `/chat/admin/conversations/${conversationId}/messages`,
        { content, imageFileId, messageType: imageFileId ? 'image' : 'text' }
      );
      return unwrapResponseData(response);
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Failed to send message');
      throw new Error(errorMessage);
    }
  },

  /**
   * Mark admin conversation messages as read
   */
  async markAdminMessagesAsRead(conversationId: string): Promise<void> {
    await apiClient.put(`/chat/admin/conversations/${conversationId}/messages/read`);
  },

  /**
   * Send an image message with optional text in an admin conversation (user side)
   */
  async uploadImage(file: File, isAdmin = false): Promise<{ fileId: string; fileUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Use correct endpoint based on chat type
      // For admin conversations: /chat/admin/upload-image
      // For visit chats: /chat/visits/upload-image
      const endpoint = isAdmin ? '/chat/admin/upload-image' : '/chat/visits/upload-image';
      const response = await apiClient.post<
        | { fileId: string; fileUrl: string }
        | { success: boolean; data: { fileId: string; fileUrl: string } }
      >(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return unwrapResponseData(response);
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Failed to upload image');
      throw new Error(errorMessage);
    }
  },
};
