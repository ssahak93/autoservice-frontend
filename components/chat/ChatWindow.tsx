'use client';

import { X, MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useUnreadCount } from '@/hooks/useChat';
import { useVisit } from '@/hooks/useVisits';

import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';

interface ChatWindowProps {
  visitId: string | null;
  serviceName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatWindow({
  visitId,
  serviceName: _serviceName,
  isOpen,
  onClose,
}: ChatWindowProps) {
  const t = useTranslations('chat');
  // Always call hooks in the same order - use enabled option for conditional fetching
  const { data: unreadCount } = useUnreadCount(visitId);
  const { data: visit, isLoading: isLoadingVisit } = useVisit(visitId);
  const { user } = useAuth();

  // Determine chat participant name
  const participantName = useMemo(() => {
    // Wait for visit data to load
    if (isLoadingVisit || !visit || !user) {
      // Don't show "Service 0" or invalid names while loading
      return t('chat', { defaultValue: 'Chat' });
    }

    // Determine if current user is customer or service owner
    const isCustomer = visit.userId === user.id;

    if (isCustomer) {
      // Current user is customer, show service name
      const autoService = visit.autoServiceProfile?.autoService || visit.autoService;
      if (autoService?.companyName) {
        return autoService.companyName;
      }
      if (autoService?.firstName || autoService?.lastName) {
        const name = `${autoService.firstName || ''} ${autoService.lastName || ''}`.trim();
        if (name) return name;
      }
      return t('service', { defaultValue: 'Service' });
    } else {
      // Current user is service owner, show customer name
      if (visit.user?.firstName || visit.user?.lastName) {
        const name = `${visit.user.firstName || ''} ${visit.user.lastName || ''}`.trim();
        if (name) return name;
      }
      return t('customer', { defaultValue: 'Customer' });
    }
  }, [visit, user, isLoadingVisit, t]);

  // Use conditional rendering in JSX instead of early return
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex h-[500px] flex-col border-t-2 border-primary-500 bg-white shadow-lg transition-all md:left-auto md:right-0 md:h-[600px] md:w-[400px] md:rounded-tl-2xl"
      role="dialog"
      aria-labelledby="chat-title"
    >
      {/* Header */}
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

      {/* Messages */}
      {visitId && (
        <>
          <div className="flex-1 overflow-hidden">
            <MessageList visitId={visitId} />
          </div>

          {/* Input */}
          <MessageInput visitId={visitId} />
        </>
      )}
    </div>
  );
}
