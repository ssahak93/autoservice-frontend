'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useMemo } from 'react';

import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useChatMessages, useMarkAsRead } from '@/hooks/useChat';
import type { Message } from '@/lib/services/chat.service';

import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  visitId: string;
}

export function MessageList({ visitId }: MessageListProps) {
  const { data, isLoading } = useChatMessages(visitId);
  const markAsRead = useMarkAsRead();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messages = useMemo(() => data?.data || [], [data?.data]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when component mounts or messages change
  useEffect(() => {
    if (messages.length > 0) {
      markAsRead.mutate(visitId);
    }
  }, [visitId, messages.length, markAsRead]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          title="No messages yet"
          description="Start the conversation by sending a message"
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto px-4 py-4">
      <AnimatePresence initial={false}>
        {messages.map((message: Message, index: number) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="mb-4"
          >
            <MessageBubble message={message} />
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
}

