'use client';

import { format } from 'date-fns';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { useAuth } from '@/hooks/useAuth';
import type { Message } from '@/lib/services/chat.service';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const t = useTranslations('chat');
  const { user } = useAuth();
  const isOwnMessage = message.senderId === user?.id;

  return (
    <div
      className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-neutral-200">
        {message.sender?.avatarFile?.fileUrl ? (
          <Image
            src={message.sender.avatarFile.fileUrl}
            alt={`${message.sender.firstName} ${message.sender.lastName}`}
            fill
            className="object-cover"
            sizes="48px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary-100 text-primary-600">
            <span className="text-xs font-semibold">
              {message.sender?.firstName?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col gap-1 ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        {/* Sender Name (only for other users) */}
        {!isOwnMessage && message.sender && (
          <span className="text-xs font-medium text-neutral-600">
            {message.sender.firstName} {message.sender.lastName}
          </span>
        )}

        {/* Message Bubble */}
        <div
          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
            isOwnMessage
              ? 'bg-primary-500 text-white'
              : 'bg-neutral-100 text-neutral-900'
          }`}
        >
          {message.messageType === 'image' && message.imageFile?.fileUrl ? (
            <div className="relative h-48 w-48 overflow-hidden rounded-lg">
              <Image
                src={message.imageFile.fileUrl}
                alt={t('imageMessage')}
                fill
                className="object-cover"
                sizes="192px"
              />
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-neutral-500">
          {format(new Date(message.createdAt), 'HH:mm')}
          {message.isRead && isOwnMessage && (
            <span className="ml-1" title={t('read')}>
              ✓✓
            </span>
          )}
        </span>
      </div>
    </div>
  );
}

