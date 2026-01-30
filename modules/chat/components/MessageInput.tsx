'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Image as ImageIcon, Send, X } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect, ChangeEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { createImagePreview, validateFile } from '@/lib/utils/fileValidation';
import { useUIStore } from '@/stores/uiStore';

import { useSocket } from '../hooks/useSocket';
import { chatService, type Message } from '../services/chat.service';

interface MessageInputProps {
  visitId?: string | null;
  conversationId?: string | null;
}

export function MessageInput({ visitId, conversationId }: MessageInputProps) {
  const t = useTranslations('chat');
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim() && !selectedImage) return;
    if (!socket || !isConnected) {
      showToast('WebSocket not connected', 'error');
      return;
    }

    const messageContent = message.trim();
    const imageToSend = selectedImage;
    let imageFileId: string | undefined;

    // Clear UI state immediately
    if (messageContent) {
      setMessage('');
    }
    if (imageToSend) {
      setSelectedImage(null);
      setImagePreview(null);
    }

    setIsSending(true);

    try {
      // If image is selected, upload it first
      if (imageToSend) {
        // Determine if this is an admin conversation or visit chat
        const isAdminChat = !!conversationId;
        const uploadResult = await chatService.uploadImage(imageToSend, isAdminChat);
        imageFileId = uploadResult.fileId;
      }

      // Send message via WebSocket
      if (conversationId) {
        // Admin conversation
        socket.emit(
          'send-conversation-message',
          {
            conversationId,
            content: messageContent || '',
            imageFileId,
          },
          (response: { success?: boolean; error?: string; message?: Message }) => {
            if (response.error) {
              showToast(response.error, 'error');
              // Restore state on error
              if (messageContent) setMessage(messageContent);
            } else {
              // Invalidate queries to refresh messages
              queryClient.invalidateQueries({
                queryKey: ['chat', 'admin', 'messages', conversationId],
              });
            }
            setIsSending(false);
          }
        );
      } else if (visitId) {
        // Visit chat
        socket.emit(
          'send-message',
          {
            visitId,
            message: {
              content: messageContent || null,
              messageType: imageFileId ? 'image' : 'text',
              imageFileId: imageFileId || null,
            },
          },
          (response: { success?: boolean; error?: string; message?: Message }) => {
            if (response.error) {
              showToast(response.error, 'error');
              // Restore state on error
              if (messageContent) setMessage(messageContent);
            } else {
              // Invalidate queries to refresh messages
              queryClient.invalidateQueries({
                queryKey: ['chat', 'messages', visitId],
              });
            }
            setIsSending(false);
          }
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      showToast(errorMessage, 'error');
      // Restore state on error
      if (messageContent) {
        setMessage(messageContent);
      }
      if (imageToSend) {
        setSelectedImage(imageToSend);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(imageToSend);
      }
      setIsSending(false);
    }
  };

  const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);

    const validation = validateFile(file, {
      maxSize: 5 * 1024 * 1024,
      allowedTypes: ['image/'],
    });

    if (!validation.isValid) {
      setImageError(validation.error || t('invalidImage', { defaultValue: 'Invalid image' }));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      setSelectedImage(file);
      const preview = await createImagePreview(file);
      setImagePreview(preview);
    } catch (_error) {
      setImageError(t('imagePreviewError', { defaultValue: 'Failed to create preview' }));
      setSelectedImage(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      // Stop typing indicator
      if (socket && isConnected) {
        if (visitId) {
          socket.emit('typing', { visitId, isTyping: false });
        } else if (conversationId) {
          socket.emit('typing', { conversationId, isTyping: false });
        }
      }
    }
  };

  // Typing indicator
  const handleTyping = () => {
    if (socket && isConnected) {
      if (visitId) {
        socket.emit('typing', { visitId, isTyping: true });
      } else if (conversationId) {
        socket.emit('typing', { conversationId, isTyping: true });
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (socket && isConnected) {
          if (visitId) {
            socket.emit('typing', { visitId, isTyping: false });
          } else if (conversationId) {
            socket.emit('typing', { conversationId, isTyping: false });
          }
        }
      }, 3000);
    }
  };

  // Clear message and image when chat changes
  const previousChatIdRef = useRef<string | null>(null);
  useEffect(() => {
    const currentChatId = visitId || conversationId || null;
    const previousChatId = previousChatIdRef.current;

    // Only clear if chat actually changed
    if (previousChatId !== null && previousChatId !== currentChatId) {
      setMessage('');
      setSelectedImage(null);
      setImagePreview(null);
      setImageError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Stop typing indicator for previous chat
      if (socket && isConnected && previousChatId) {
        // We don't know if it was visitId or conversationId, so try both
        socket.emit('typing', { visitId: previousChatId, isTyping: false });
        socket.emit('typing', { conversationId: previousChatId, isTyping: false });
      }
    }

    previousChatIdRef.current = currentChatId;
  }, [visitId, conversationId, socket, isConnected]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (socket && isConnected) {
        if (visitId) {
          socket.emit('typing', { visitId, isTyping: false });
        } else if (conversationId) {
          socket.emit('typing', { conversationId, isTyping: false });
        }
      }
    };
  }, [socket, isConnected, visitId, conversationId]);

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isLoading = isSending;

  return (
    <div className="p-4">
      {imagePreview && (
        <div className="animate-in fade-in slide-in-from-bottom-2 relative mb-3 inline-block">
          <div className="relative h-32 w-32 overflow-hidden rounded-lg border-2 border-primary-300 shadow-md ring-2 ring-primary-100">
            <Image
              src={imagePreview}
              alt="Preview"
              fill
              className="object-cover"
              sizes="128px"
              unoptimized
            />
          </div>
          <button
            onClick={removeImage}
            className="absolute -right-2 -top-2 rounded-full bg-error-500 p-1.5 text-white shadow-lg transition-all hover:scale-110 hover:bg-error-600 active:scale-95"
            aria-label={t('removeImage')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {imageError && (
        <div className="mb-3 rounded-lg bg-error-50 p-2 text-sm text-error-600">{imageError}</div>
      )}

      <div className="relative flex items-end gap-2">
        {(visitId || conversationId) && (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
              aria-label={t('attachImage')}
            >
              <ImageIcon className="h-5 w-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </>
        )}

        <textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          onKeyPress={handleKeyPress}
          placeholder={t('typeMessage')}
          rows={1}
          className="flex-1 resize-none rounded-lg border-2 border-neutral-300 px-4 py-2.5 transition-all hover:border-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          style={{ minHeight: '44px', maxHeight: '120px' }}
        />

        <Button
          onClick={handleSend}
          disabled={(!message.trim() && !selectedImage) || isLoading}
          isLoading={isLoading}
          className="flex-shrink-0 transition-all hover:scale-105 active:scale-95"
          aria-label={t('send')}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
