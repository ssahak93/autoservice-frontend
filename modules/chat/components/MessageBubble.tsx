'use client';

import { Smile, Check, CheckCheck } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ImageLightbox } from '@/components/common/ImageLightbox';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils/cn';
import { formatTimeWithSeconds } from '@/lib/utils/date';
import { getAvatarUrl } from '@/lib/utils/file';
import { formatMessageReadTime, formatMessageSentTime } from '@/lib/utils/time';

import { useAddReaction } from '../hooks/useChat';
import type { Message } from '../services/chat.service';

import { ReactionPicker } from './ReactionPicker';

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
  showName?: boolean;
  isGrouped?: boolean;
  isReadOnly?: boolean;
}

export function MessageBubble({
  message,
  showAvatar = true,
  showName = true,
  isGrouped = false,
  isReadOnly = false,
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

  const timeString = formatMessageSentTime(message.createdAt);

  const getReadTimeString = () => {
    return formatMessageReadTime(message.readAt, message.createdAt, t);
  };

  const getSenderName = () => {
    if (message.provider) {
      if (message.provider.serviceType === 'company') {
        return message.provider.companyName || 'Provider';
      }
      const name = `${message.provider.firstName || ''} ${message.provider.lastName || ''}`.trim();
      return name || 'Provider';
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

  // Avatar component
  const renderAvatar = () => {
    if (!showAvatar) {
      return <div className="w-10 flex-shrink-0" />;
    }

    const avatarUrl = isOwnMessage
      ? getAvatarUrl(user)
      : getAvatarUrl(message.provider) ||
        getAvatarUrl(message.teamMember) ||
        getAvatarUrl(message.sender);

    const displayName = isOwnMessage
      ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'You'
      : senderName;

    return (
      <div className="relative h-10 w-10 flex-shrink-0">
        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-primary-400 to-primary-600 shadow-md ring-2 ring-white">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              fill
              className="object-cover"
              sizes="40px"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600 text-white">
              <span className="text-sm font-bold">
                {isOwnMessage
                  ? user?.firstName?.charAt(0).toUpperCase() ||
                    user?.lastName?.charAt(0).toUpperCase() ||
                    'U'
                  : message.provider?.serviceType === 'company'
                    ? message.provider.companyName?.charAt(0).toUpperCase() || 'P'
                    : message.provider?.firstName?.charAt(0).toUpperCase() ||
                      message.provider?.lastName?.charAt(0).toUpperCase() ||
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
    );
  };

  return (
    <div className={`flex gap-3 ${isGrouped ? 'mt-1' : 'mt-4'}`}>
      {/* Avatar - left for others */}
      {!isOwnMessage && renderAvatar()}

      <div
        className={`flex flex-1 flex-col gap-1 ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[75%]`}
      >
        {!isOwnMessage && showName && !isGrouped && (message.sender || message.provider) && (
          <div className="flex flex-col gap-0.5 px-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-semibold text-neutral-700">{senderName}</span>
              {teamMemberName && (
                <span className="text-xs text-neutral-500">({teamMemberName})</span>
              )}
            </div>
            {message.provider && teamMemberName && (
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

            {!isReadOnly && (
              <>
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
              </>
            )}
          </div>

          {Object.keys(reactionsByEmoji).length > 0 && (
            <div
              className={`mt-2 flex flex-wrap gap-1.5 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              {Object.entries(reactionsByEmoji).map(([emoji, reactions]) => (
                <button
                  key={emoji}
                  onClick={() => !isReadOnly && handleReaction(emoji)}
                  disabled={isReadOnly}
                  className={cn(
                    'flex items-center gap-1 rounded-full border-2 border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium shadow-sm transition-all',
                    isReadOnly
                      ? 'cursor-default opacity-75'
                      : 'hover:scale-105 hover:border-primary-400 hover:bg-primary-50 hover:shadow-md active:scale-95'
                  )}
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

        <div className={`flex flex-col gap-0.5 px-1 ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          {/* Sent time - always shown */}
          <span className="text-xs font-medium text-neutral-500">{timeString}</span>

          {/* Read status and read time - only for own messages, shown separately */}
          {isOwnMessage && (
            <div className="flex items-center gap-1">
              {message.isRead ? (
                <>
                  <CheckCheck className="h-3.5 w-3.5 text-primary-500" />
                  {message.readAt && (
                    <span
                      className="text-xs font-medium text-primary-600"
                      title={getReadTimeString() || t('read', { defaultValue: 'Read' })}
                    >
                      {(() => {
                        const readTimeString = formatMessageReadTime(
                          message.readAt,
                          message.createdAt,
                          t
                        );
                        // If it's the same minute, show with seconds, otherwise use the formatted string
                        if (readTimeString) {
                          const readTime = new Date(message.readAt);
                          const sentTime = new Date(message.createdAt);
                          const timeDiff = readTime.getTime() - sentTime.getTime();
                          const isSameMinute = Math.abs(timeDiff) < 60000;
                          return isSameMinute
                            ? formatTimeWithSeconds(message.readAt)
                            : readTimeString;
                        }
                        return null;
                      })()}
                    </span>
                  )}
                </>
              ) : (
                <Check
                  className="h-3.5 w-3.5 text-neutral-400"
                  aria-label={t('sent', { defaultValue: 'Sent' })}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Avatar - right for own messages */}
      {isOwnMessage && renderAvatar()}
    </div>
  );
}
