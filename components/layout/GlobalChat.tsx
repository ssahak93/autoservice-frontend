'use client';

import { ChatWindow } from '@/components/chat/ChatWindow';
import { useChatStore } from '@/stores/chatStore';

/**
 * GlobalChat Component
 *
 * Displays the chat window when a visit chat is opened.
 * This component is rendered globally in the layout and manages
 * the chat state through the chatStore.
 *
 * Always renders ChatWindow to ensure hooks are called in consistent order.
 * Use isOpen prop to control visibility instead of conditional rendering.
 */
export function GlobalChat() {
  const { openChat, closeChat } = useChatStore();

  // Always render ChatWindow to maintain consistent hook order
  // Pass null visitId when openChat is null - hooks handle this gracefully
  // The ChatWindow will handle the isOpen={false} case internally
  return (
    <ChatWindow
      visitId={openChat?.visitId || null}
      serviceName={openChat?.serviceName}
      isOpen={!!openChat}
      onClose={closeChat}
    />
  );
}
