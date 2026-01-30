'use client';

import { ChatWindow } from '@/modules/chat/components/ChatWindow';
import { useChatStore } from '@/modules/chat/state/chatStore';

/**
 * GlobalChat Component
 *
 * Displays the chat window when a visit chat or admin conversation is opened.
 * This component is rendered globally in the layout and manages
 * the chat state through the chatStore.
 *
 * Always renders ChatWindow to ensure hooks are called in consistent order.
 * Use isOpen prop to control visibility instead of conditional rendering.
 */
export function GlobalChat() {
  const { openChat, closeChat } = useChatStore();

  // Always render ChatWindow to maintain consistent hook order
  // Pass null visitId/conversationId when openChat is null - hooks handle this gracefully
  // The ChatWindow will handle the isOpen={false} case internally
  return (
    <ChatWindow
      visitId={openChat?.type === 'visit' ? openChat.visitId : null}
      conversationId={openChat?.type === 'admin' ? openChat.conversationId : null}
      title={openChat?.type === 'admin' ? openChat.title : undefined}
      serviceName={openChat?.type === 'visit' ? openChat.serviceName : undefined}
      isOpen={!!openChat}
      onClose={closeChat}
    />
  );
}
