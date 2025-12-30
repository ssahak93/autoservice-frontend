'use client';

import { MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ChatWindow } from '@/components/chat/ChatWindow';
import { Button } from '@/components/ui/Button';
import { useUnreadCount } from '@/hooks/useChat';

interface VisitChatButtonProps {
  visitId: string;
  serviceName?: string;
}

export function VisitChatButton({ visitId, serviceName }: VisitChatButtonProps) {
  const t = useTranslations('chat');
  const [isOpen, setIsOpen] = useState(false);
  const { data: unreadCount } = useUnreadCount(visitId);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="relative"
      >
        <MessageSquare className="h-4 w-4" />
        {t('chat')}
        {unreadCount && unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-error-500 text-xs font-medium text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      <ChatWindow
        visitId={visitId}
        serviceName={serviceName}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

