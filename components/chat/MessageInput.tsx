'use client';

import { Image as ImageIcon, Send, X } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState, useRef, ChangeEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { useSendMessage, useSendImageMessage } from '@/hooks/useChat';
import { createImagePreview, validateFile } from '@/lib/utils/fileValidation';

interface MessageInputProps {
  visitId: string;
}

/**
 * MessageInput Component
 *
 * Single Responsibility: Only handles message input UI
 * Dependency Inversion: Uses file validation utilities instead of inline logic
 */
export function MessageInput({ visitId }: MessageInputProps) {
  const t = useTranslations('chat');
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendMessage = useSendMessage();
  const sendImageMessage = useSendImageMessage();

  const handleSend = async () => {
    if (!message.trim() && !selectedImage) return;

    try {
      if (selectedImage) {
        await sendImageMessage.mutateAsync({ visitId, file: selectedImage });
        setSelectedImage(null);
        setImagePreview(null);
      } else if (message.trim()) {
        await sendMessage.mutateAsync({
          visitId,
          dto: { content: message.trim() },
        });
        setMessage('');
      }
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);

    // Validate file using utility function
    const validation = validateFile(file, {
      maxSize: 5 * 1024 * 1024, // 5MB
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
    } catch (error) {
      setImageError(t('imagePreviewError', { defaultValue: 'Failed to create preview' }));
      setSelectedImage(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isLoading = sendMessage.isPending || sendImageMessage.isPending;

  return (
    <div className="border-t border-neutral-200 bg-white p-4">
      {/* Image Preview */}
      {imagePreview && (
        <div className="relative mb-3 inline-block">
          <div className="relative h-32 w-32 overflow-hidden rounded-lg border border-neutral-200">
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
            className="absolute -right-2 -top-2 rounded-full bg-error-500 p-1 text-white transition-colors hover:bg-error-600"
            aria-label={t('removeImage')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Image Error */}
      {imageError && (
        <div className="mb-3 rounded-lg bg-error-50 p-2 text-sm text-error-600">{imageError}</div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2">
        {/* Image Upload Button */}
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

        {/* Text Input */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('typeMessage')}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-neutral-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          style={{ minHeight: '40px', maxHeight: '120px' }}
        />

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={(!message.trim() && !selectedImage) || isLoading}
          isLoading={isLoading}
          className="flex-shrink-0"
          aria-label={t('send')}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
