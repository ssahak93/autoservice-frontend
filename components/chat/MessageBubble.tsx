'use client';

import { format, isToday, isYesterday } from 'date-fns';
import { Smile, Check, CheckCheck } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useAddReaction } from '@/hooks/useChat';
import type { Message } from '@/lib/services/chat.service';

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
  const addReaction = useAddReaction();

  const handleReaction = (emoji: string) => {
    addReaction.mutate({ messageId: message.id, emoji });
    setShowReactionPicker(false);
  };

  // Group reactions by emoji
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

  // Format time
  const messageTime = new Date(message.createdAt);
  const timeString = format(messageTime, 'HH:mm');

  // Format read time
  const getReadTimeString = () => {
    if (!message.readAt) return null;
    const readTime = new Date(message.readAt);
    if (isToday(readTime)) {
      return format(readTime, 'HH:mm');
    } else if (isYesterday(readTime)) {
      return t('yesterdayAt', {
        time: format(readTime, 'HH:mm'),
        defaultValue: `Yesterday at ${format(readTime, 'HH:mm')}`,
      });
    } else {
      return format(readTime, 'dd.MM.yyyy HH:mm');
    }
  };

  // Determine sender name - show auto service name if it's a service message, otherwise show sender name
  const getSenderName = () => {
    // If it's a service message, show auto service name
    if (message.autoService) {
      if (message.autoService.serviceType === 'company') {
        return message.autoService.companyName || 'Auto Service';
      } else {
        const name =
          `${message.autoService.firstName || ''} ${message.autoService.lastName || ''}`.trim();
        return name || 'Auto Service';
      }
    }
    // Otherwise show sender name
    if (message.sender) {
      return `${message.sender.firstName || ''} ${message.sender.lastName || ''}`.trim() || 'User';
    }
    return 'User';
  };

  const senderName = getSenderName();

  // Get team member name if available
  const teamMemberName = message.teamMember
    ? `${message.teamMember.firstName} ${message.teamMember.lastName}`.trim()
    : null;

  return (
    <div
      className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} ${isGrouped ? 'mt-1' : 'mt-4'}`}
    >
      {/* Avatar */}
      {showAvatar && (
        <div className="relative h-10 w-10 flex-shrink-0">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-primary-400 to-primary-600 shadow-md ring-2 ring-white">
            {/* Prefer auto service avatar, then team member avatar, then sender avatar */}
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
          {/* Online status indicator (placeholder - can be enhanced with real online status) */}
          {!isOwnMessage && (
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
          )}
        </div>
      )}

      {/* Spacer when avatar is hidden */}
      {!showAvatar && <div className="w-10 flex-shrink-0" />}

      {/* Message Content */}
      <div
        className={`flex flex-1 flex-col gap-1 ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[75%]`}
      >
        {/* Sender Name and Time (only for other users or when not grouped) */}
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

        {/* Message Bubble */}
        <div className="group relative">
          <div
            className={`relative rounded-2xl px-4 py-2.5 shadow-sm transition-all hover:shadow-md ${
              isOwnMessage
                ? 'rounded-tr-sm bg-gradient-to-br from-primary-500 to-primary-600 text-white'
                : 'rounded-tl-sm border border-neutral-200 bg-white text-neutral-900'
            }`}
          >
            {/* Image message */}
            {message.messageType === 'image' && message.imageFile?.fileUrl && (
              <div className="relative h-48 w-48 overflow-hidden rounded-lg">
                <Image
                  src={message.imageFile.fileUrl}
                  alt={t('imageMessage')}
                  fill
                  className="object-cover"
                  sizes="192px"
                  unoptimized
                />
              </div>
            )}

            {/* Text content - show for all messages that have content */}
            {message.content && (
              <p
                className={`whitespace-pre-wrap break-words text-sm leading-relaxed ${message.messageType === 'image' && message.imageFile?.fileUrl ? 'mt-2' : ''}`}
              >
                {message.content}
              </p>
            )}

            {/* Reaction Button (hover) */}
            <button
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              className={`absolute -bottom-2 ${
                isOwnMessage ? 'left-2' : 'right-2'
              } z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white opacity-0 shadow-lg ring-1 ring-neutral-200 transition-all hover:scale-110 hover:bg-neutral-50 group-hover:opacity-100`}
              aria-label={t('addReaction', { defaultValue: 'Add reaction' })}
            >
              <Smile className="h-4 w-4 text-neutral-600" />
            </button>

            {/* Reaction Picker */}
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

          {/* Reactions */}
          {Object.keys(reactionsByEmoji).length > 0 && (
            <div
              className={`mt-1.5 flex flex-wrap gap-1.5 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              {Object.entries(reactionsByEmoji).map(([emoji, reactions]) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-2 py-1 text-xs shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50 hover:shadow"
                  title={reactions?.map((r) => r.user?.firstName || 'User').join(', ')}
                >
                  <span className="text-base">{emoji}</span>
                  {reactions && reactions.length > 1 && (
                    <span className="font-medium text-neutral-700">{reactions.length}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp and Read Status */}
        <div
          className={`flex items-center gap-1.5 px-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
        >
          {isOwnMessage && (
            <>
              {/* Read status icons */}
              {message.isRead ? (
                <div
                  className="flex items-center gap-0.5"
                  title={getReadTimeString() || t('read', { defaultValue: 'Read' })}
                >
                  <CheckCheck className="h-3.5 w-3.5 text-primary-500" />
                </div>
              ) : (
                <div
                  className="flex items-center gap-0.5"
                  title={t('sent', { defaultValue: 'Sent' })}
                >
                  <Check className="h-3.5 w-3.5 text-neutral-400" />
                </div>
              )}
            </>
          )}
          <span className="text-xs text-neutral-500">{timeString}</span>
          {message.isRead && message.readAt && isOwnMessage && (
            <span className="text-xs text-neutral-400" title={getReadTimeString() || ''}>
              {t('readAt', {
                time: format(new Date(message.readAt), 'HH:mm'),
                defaultValue: `Read at ${format(new Date(message.readAt), 'HH:mm')}`,
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
