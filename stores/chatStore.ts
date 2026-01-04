import { create } from 'zustand';

interface ChatState {
  openChat: {
    visitId: string;
    serviceName?: string;
  } | null;
  setOpenChat: (visitId: string, serviceName?: string) => void;
  closeChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  openChat: null,
  setOpenChat: (visitId: string, serviceName?: string) =>
    set({ openChat: { visitId, serviceName } }),
  closeChat: () => set({ openChat: null }),
}));
