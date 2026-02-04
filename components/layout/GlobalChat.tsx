'use client';

import { usePathname } from 'next/navigation';

import { UnifiedChatWindow } from '@/components/chat/UnifiedChatWindow';
import { useChatStore } from '@/modules/chat/state/chatStore';

/**
 * GlobalChat Component
 *
 * Displays the chat window when a visit chat or admin conversation is opened.
 * This component is rendered globally in the layout and manages
 * the chat state through the chatStore.
 *
 * Uses UnifiedChatWindow for consistent chat experience across all pages.
 *
 * Note: Does not render on /support page as it has its own embedded chat.
 */
export function GlobalChat() {
  const { openChat, closeChat } = useChatStore();
  const pathname = usePathname();

  // Don't show GlobalChat on support page - it has its own embedded chat
  const isSupportPage = pathname?.includes('/support');

  if (isSupportPage || !openChat) {
    return null;
  }

  return (
    <UnifiedChatWindow
      visitId={openChat?.type === 'visit' ? openChat.visitId : null}
      conversationId={openChat?.type === 'admin' ? openChat.conversationId : null}
      title={openChat?.type === 'admin' ? openChat.title : undefined}
      serviceName={openChat?.type === 'visit' ? openChat.serviceName : undefined}
      isOpen={!!openChat}
      onClose={closeChat}
      variant="modal"
    />
  );
}
