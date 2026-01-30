'use client';

import { X, MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useVisit } from '@/hooks/useVisits';

import { useUnreadCount } from '../hooks/useChat';

import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';

interface ChatWindowProps {
  visitId?: string | null;
  conversationId?: string | null;
  title?: string;
  serviceName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatWindow({
  visitId,
  conversationId,
  title,
  serviceName: _serviceName,
  isOpen,
  onClose,
}: ChatWindowProps) {
  const t = useTranslations('chat');
  const { data: unreadCount } = useUnreadCount(visitId || null);
  const { data: visit, isLoading: isLoadingVisit } = useVisit(visitId || null);
  const { user } = useAuth();

  const participantName = useMemo(() => {
    // Admin conversation
    if (conversationId && title) {
      return title;
    }

    // Visit chat
    if (isLoadingVisit || !visit || !user) {
      return t('chat', { defaultValue: 'Chat' });
    }

    const isCustomer = visit.userId === user.id;

    if (isCustomer) {
      const autoService = visit.autoServiceProfile?.autoService || visit.autoService;
      if (autoService?.companyName) {
        return autoService.companyName;
      }
      if (autoService?.firstName || autoService?.lastName) {
        const name = `${autoService.firstName || ''} ${autoService.lastName || ''}`.trim();
        if (name) return name;
      }
      return t('service', { defaultValue: 'Service' });
    }

    if (visit.user?.firstName || visit.user?.lastName) {
      const name = `${visit.user.firstName || ''} ${visit.user.lastName || ''}`.trim();
      if (name) return name;
    }
    return t('customer', { defaultValue: 'Customer' });
  }, [visit, user, isLoadingVisit, t, conversationId, title]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex h-[500px] flex-col border-t-2 border-primary-500 bg-white shadow-lg transition-all md:left-auto md:right-0 md:h-[600px] md:w-[400px] md:rounded-tl-2xl"
      role="dialog"
      aria-labelledby="chat-title"
    >
      <div className="flex items-center justify-between border-b border-neutral-200 bg-gradient-primary px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" aria-hidden="true" />
          <h3 id="chat-title" className="font-semibold">
            {participantName}
          </h3>
          {unreadCount && unreadCount > 0 && (
            <span className="rounded-full bg-error-500 px-2 py-0.5 text-xs font-medium">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-white/80 transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label={t('close')}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {(visitId || conversationId) && (
        <>
          <div className="flex-1 overflow-hidden">
            <MessageList visitId={visitId || null} conversationId={conversationId || null} />
          </div>

          <MessageInput visitId={visitId || null} conversationId={conversationId || null} />
        </>
      )}
    </div>
  );
}
