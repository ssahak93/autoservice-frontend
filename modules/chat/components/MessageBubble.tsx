'use client';

import { format } from 'date-fns/format';
import { isToday } from 'date-fns/isToday';
import { isYesterday } from 'date-fns/isYesterday';
import { Smile, Check, CheckCheck } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ImageLightbox } from '@/components/common/ImageLightbox';
import { useAuth } from '@/hooks/useAuth';

import { useAddReaction } from '../hooks/useChat';
import type { Message } from '../services/chat.service';

import { ReactionPicker } from './ReactionPicker';

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
  showName?: boolean;
  isGrouped?: boolean;
}

export function MessageBubble({
  message,
  showAvatar = true,
  showName = true,
  isGrouped = false,
}: MessageBubbleProps) {
  const t = useTranslations('chat');
  const { user } = useAuth();
  const isOwnMessage = message.senderId === user?.id;
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const addReaction = useAddReaction();

  const handleReaction = (emoji: string) => {
    addReaction.mutate({ messageId: message.id, emoji });
    setShowReactionPicker(false);
  };

  const reactionsByEmoji =
    message.reactions?.reduce(
      (acc, reaction) => {
        if (!acc[reaction.emoji]) {
          acc[reaction.emoji] = [];
        }
        acc[reaction.emoji].push(reaction);
        return acc;
      },
      {} as Record<string, typeof message.reactions>
    ) || {};

  const messageTime = new Date(message.createdAt);
  const timeString = format(messageTime, 'HH:mm');

  const getReadTimeString = () => {
    if (!message.readAt) return null;
    const readTime = new Date(message.readAt);
    if (isToday(readTime)) {
      return format(readTime, 'HH:mm');
    }
    if (isYesterday(readTime)) {
      return t('yesterdayAt', {
        time: format(readTime, 'HH:mm'),
        defaultValue: `Yesterday at ${format(readTime, 'HH:mm')}`,
      });
    }
    return format(readTime, 'dd.MM.yyyy HH:mm');
  };

  const getSenderName = () => {
    if (message.autoService) {
      if (message.autoService.serviceType === 'company') {
        return message.autoService.companyName || 'Auto Service';
      }
      const name =
        `${message.autoService.firstName || ''} ${message.autoService.lastName || ''}`.trim();
      return name || 'Auto Service';
    }
    if (message.sender) {
      // Admin doesn't have firstName/lastName, use "Admin" as display name
      if (!message.sender.firstName && !message.sender.lastName) {
        return 'Admin';
      }
      return `${message.sender.firstName || ''} ${message.sender.lastName || ''}`.trim() || 'User';
    }
    return 'User';
  };

  const senderName = getSenderName();
  const teamMemberName = message.teamMember
    ? `${message.teamMember.firstName} ${message.teamMember.lastName}`.trim()
    : null;

  return (
    <div
      className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} ${isGrouped ? 'mt-1' : 'mt-4'}`}
    >
      {showAvatar && (
        <div className="relative h-10 w-10 flex-shrink-0">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-primary-400 to-primary-600 shadow-md ring-2 ring-white">
            {message.autoService?.avatarFile?.fileUrl ||
            message.teamMember?.avatarFile?.fileUrl ||
            message.sender?.avatarFile?.fileUrl ? (
              <Image
                src={
                  message.autoService?.avatarFile?.fileUrl ||
                  message.teamMember?.avatarFile?.fileUrl ||
                  message.sender?.avatarFile?.fileUrl ||
                  ''
                }
                alt={senderName}
                fill
                className="object-cover"
                sizes="40px"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600 text-white">
                <span className="text-sm font-bold">
                  {message.autoService?.serviceType === 'company'
                    ? message.autoService.companyName?.charAt(0).toUpperCase() || 'A'
                    : message.autoService?.firstName?.charAt(0).toUpperCase() ||
                      message.autoService?.lastName?.charAt(0).toUpperCase() ||
                      message.teamMember?.firstName?.charAt(0).toUpperCase() ||
                      message.teamMember?.lastName?.charAt(0).toUpperCase() ||
                      message.sender?.firstName?.charAt(0).toUpperCase() ||
                      message.sender?.lastName?.charAt(0).toUpperCase() ||
                      'U'}
                </span>
              </div>
            )}
          </div>
          {!isOwnMessage && (
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
          )}
        </div>
      )}

      {!showAvatar && <div className="w-10 flex-shrink-0" />}

      <div
        className={`flex flex-1 flex-col gap-1 ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[75%]`}
      >
        {!isOwnMessage && showName && !isGrouped && (message.sender || message.autoService) && (
          <div className="flex flex-col gap-0.5 px-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-semibold text-neutral-700">{senderName}</span>
              {teamMemberName && (
                <span className="text-xs text-neutral-500">({teamMemberName})</span>
              )}
              <span className="text-xs text-neutral-500">{timeString}</span>
            </div>
            {message.autoService && teamMemberName && (
              <span className="text-xs text-neutral-400">
                {message.teamMember?.role === 'owner'
                  ? 'Owner'
                  : message.teamMember?.role === 'manager'
                    ? 'Manager'
                    : 'Employee'}
              </span>
            )}
          </div>
        )}

        <div className="group relative">
          <div
            className={`relative rounded-2xl px-4 py-2.5 shadow-sm transition-all hover:scale-[1.02] hover:shadow-lg ${
              isOwnMessage
                ? 'rounded-tr-sm bg-gradient-to-br from-primary-500 to-primary-600 text-white'
                : 'rounded-tl-sm border border-neutral-200 bg-white text-neutral-900 hover:border-primary-300'
            }`}
          >
            {message.messageType === 'image' && message.imageFile?.fileUrl && (
              <>
                <button
                  onClick={() => setShowImageLightbox(true)}
                  className="relative h-48 w-48 cursor-pointer overflow-hidden rounded-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <Image
                    src={message.imageFile.fileUrl}
                    alt={t('imageMessage')}
                    fill
                    className="object-cover"
                    sizes="192px"
                    unoptimized
                  />
                </button>
                {showImageLightbox && message.imageFile?.fileUrl && (
                  <ImageLightbox
                    images={[message.imageFile.fileUrl]}
                    initialIndex={0}
                    isOpen={showImageLightbox}
                    onClose={() => setShowImageLightbox(false)}
                    title={t('imageMessage')}
                  />
                )}
              </>
            )}

            {message.content && (
              <p
                className={`whitespace-pre-wrap break-words text-sm leading-relaxed ${message.messageType === 'image' && message.imageFile?.fileUrl ? 'mt-2' : ''}`}
              >
                {message.content}
              </p>
            )}

            <button
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              className={`absolute -bottom-2 ${
                isOwnMessage ? 'left-2' : 'right-2'
              } z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white opacity-0 shadow-lg ring-2 ring-primary-200 transition-all hover:scale-110 hover:bg-primary-50 hover:ring-primary-300 group-hover:opacity-100`}
              aria-label={t('addReaction', { defaultValue: 'Add reaction' })}
            >
              <Smile className="h-4 w-4 text-primary-600" />
            </button>

            {showReactionPicker && (
              <div
                className={`absolute z-20 ${isOwnMessage ? 'left-0' : 'right-0'} bottom-full mb-2`}
              >
                <ReactionPicker
                  onSelect={handleReaction}
                  onClose={() => setShowReactionPicker(false)}
                />
              </div>
            )}
          </div>

          {Object.keys(reactionsByEmoji).length > 0 && (
            <div
              className={`mt-2 flex flex-wrap gap-1.5 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              {Object.entries(reactionsByEmoji).map(([emoji, reactions]) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="flex items-center gap-1 rounded-full border-2 border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium shadow-sm transition-all hover:scale-105 hover:border-primary-400 hover:bg-primary-50 hover:shadow-md active:scale-95"
                  title={reactions
                    ?.map((reaction) => reaction.user?.firstName || 'User')
                    .join(', ')}
                >
                  <span className="text-lg">{emoji}</span>
                  {reactions && reactions.length > 1 && (
                    <span className="font-semibold text-neutral-700">{reactions.length}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          className={`flex items-center gap-1.5 px-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
        >
          {isOwnMessage && (
            <>
              {message.isRead ? (
                <div
                  className="flex items-center gap-1"
                  title={getReadTimeString() || t('read', { defaultValue: 'Read' })}
                >
                  <CheckCheck className="h-4 w-4 text-primary-500" />
                  {message.readAt && (
                    <span className="text-xs font-medium text-primary-600">
                      {format(new Date(message.readAt), 'HH:mm')}
                    </span>
                  )}
                </div>
              ) : (
                <div
                  className="flex items-center gap-0.5"
                  title={t('sent', { defaultValue: 'Sent' })}
                >
                  <Check className="h-4 w-4 text-neutral-400" />
                </div>
              )}
            </>
          )}
          {!isOwnMessage && (
            <span className="text-xs font-medium text-neutral-500">{timeString}</span>
          )}
          {isOwnMessage && !message.isRead && (
            <span className="text-xs font-medium text-neutral-500">{timeString}</span>
          )}
          {message.isRead && message.readAt && isOwnMessage && getReadTimeString() && (
            <span className="text-xs text-neutral-500" title={getReadTimeString() || ''}>
              • {getReadTimeString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
