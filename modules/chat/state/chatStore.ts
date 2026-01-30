import { create } from 'zustand';

type ChatType = 'visit' | 'admin';

interface ChatState {
  openChat: {
    type: ChatType;
    visitId?: string;
    conversationId?: string;
    serviceName?: string;
    title?: string;
  } | null;
  setOpenVisitChat: (visitId: string, serviceName?: string) => void;
  setOpenAdminChat: (conversationId: string, title?: string) => void;
  closeChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  openChat: null,
  setOpenVisitChat: (visitId: string, serviceName?: string) =>
    set({ openChat: { type: 'visit', visitId, serviceName } }),
  setOpenAdminChat: (conversationId: string, title?: string) =>
    set({ openChat: { type: 'admin', conversationId, title } }),
  closeChat: () => set({ openChat: null }),
}));
