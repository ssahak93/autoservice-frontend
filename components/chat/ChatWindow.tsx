'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

import { useUnreadCount } from '@/hooks/useChat';
import { getAnimationVariants } from '@/lib/utils/animations';

import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';

interface ChatWindowProps {
  visitId: string;
  serviceName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatWindow({ visitId, serviceName, isOpen, onClose }: ChatWindowProps) {
  const t = useTranslations('chat');
  const { data: unreadCount } = useUnreadCount(visitId);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const variants = getAnimationVariants();

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            {...variants.fadeIn}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Chat Window */}
          <motion.div
            {...variants.modal}
            className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-white shadow-2xl md:inset-auto md:bottom-4 md:right-4 md:h-[600px] md:w-full md:max-w-md md:rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 bg-gradient-primary px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" aria-hidden="true" />
                <h3 id="chat-title" className="font-semibold">
                  {serviceName || t('chat')}
                </h3>
                {unreadCount && unreadCount > 0 && (
                  <span className="rounded-full bg-error-500 px-2 py-0.5 text-xs font-medium">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="rounded-lg p-1 text-white/80 transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label={t('close')}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden">
              <MessageList visitId={visitId} />
            </div>

            {/* Input */}
            <MessageInput visitId={visitId} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
