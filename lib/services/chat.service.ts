import { apiClient } from '@/lib/api/client';

export interface Message {
  id: string;
  visitId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'image';
  imageFileId?: string;
  imageFile?: {
    fileUrl: string;
  };
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarFile?: {
      fileUrl: string;
    };
  };
}

export interface SendMessageDto {
  content: string;
  messageType?: 'text' | 'image';
  imageFileId?: string;
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
    const response = await apiClient.get<ChatMessagesResponse>(
      `/chat/visits/${visitId}/messages`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  },

  /**
   * Send a text message
   */
  async sendMessage(visitId: string, dto: SendMessageDto): Promise<Message> {
    const response = await apiClient.post<Message>(
      `/chat/visits/${visitId}/messages`,
      dto
    );
    return response.data;
  },

  /**
   * Send an image message
   */
  async sendImageMessage(visitId: string, file: File): Promise<Message> {
    const formData = new FormData();
    formData.append('file', file);

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
  },

  /**
   * Mark messages as read
   */
  async markAsRead(visitId: string): Promise<void> {
    await apiClient.put(`/chat/visits/${visitId}/messages/read`);
  },

  /**
   * Get unread message count
   */
  async getUnreadCount(visitId: string): Promise<number> {
    const response = await apiClient.get<{ count: number }>(
      `/chat/visits/${visitId}/unread-count`
    );
    return response.data.count;
  },
};

