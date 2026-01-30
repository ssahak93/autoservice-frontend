'use client';

import { MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';
import { useUnreadCount } from '@/modules/chat/hooks/useChat';
import { useChatStore } from '@/modules/chat/state/chatStore';

interface VisitChatButtonProps {
  visitId: string;
  serviceName?: string;
}

export function VisitChatButton({ visitId, serviceName }: VisitChatButtonProps) {
  const t = useTranslations('chat');
  const { data: unreadCount = 0 } = useUnreadCount(visitId);
  const { setOpenVisitChat } = useChatStore();

  const hasUnread = unreadCount > 0;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setOpenVisitChat(visitId, serviceName)}
      className="relative flex items-center gap-2 transition-all hover:border-primary-300 hover:bg-primary-50"
    >
      <MessageSquare className="h-4 w-4" />
      <span>{t('chat')}</span>
      {hasUnread && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-error-500 px-1.5 text-xs font-semibold text-white shadow-sm">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Button>
  );
}
