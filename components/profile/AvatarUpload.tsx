'use client';

import { Camera, User, X } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { useUploadAvatar } from '@/hooks/useProfile';
import { cn } from '@/lib/utils/cn';
import { validateFile, createImagePreview } from '@/lib/utils/fileValidation';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  userName: string;
  className?: string;
}

/**
 * AvatarUpload Component
 *
 * Single Responsibility: Handles avatar upload UI and logic
 * Open/Closed: Can be extended with new upload features
 */
export function AvatarUpload({ currentAvatarUrl, userName, className }: AvatarUploadProps) {
  const t = useTranslations('profile');
  const uploadAvatar = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file
    const validation = validateFile(file, {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/'],
      allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
    });

    if (!validation.isValid) {
      setError(validation.error || t('invalidImage', { defaultValue: 'Invalid image file' }));
      return;
    }

    // Create preview
    try {
      const previewUrl = await createImagePreview(file);
      setPreview(previewUrl);
    } catch (err) {
      setError(t('previewError', { defaultValue: 'Failed to create preview' }));
      return;
    }

    // Upload file
    try {
      await uploadAvatar.mutateAsync(file);
      setPreview(null);
    } catch (err) {
      // Error is handled in the hook
    }
  };

  const handleRemovePreview = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayImage = preview || currentAvatarUrl;

  return (
    <div className={cn('relative', className)}>
      <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full sm:h-40 sm:w-40">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={userName}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 128px, 160px"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-400 to-secondary-400">
            <User className="h-16 w-16 text-white sm:h-20 sm:w-20" />
          </div>
        )}

        {/* Upload Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
          <label
            htmlFor="avatar-upload"
            className="flex cursor-pointer items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-white"
          >
            <Camera className="h-4 w-4" />
            <span>{t('uploadPhoto')}</span>
          </label>
        </div>
      </div>

      {/* Preview Badge */}
      {preview && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full bg-primary-500 px-3 py-1 text-xs font-medium text-white">
            <span>{t('preview', { defaultValue: 'Preview' })}</span>
            <button
              type="button"
              onClick={handleRemovePreview}
              className="rounded-full hover:bg-primary-600"
              aria-label={t('removePreview', { defaultValue: 'Remove preview' })}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && <p className="mt-2 text-center text-sm text-error-600">{error}</p>}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        id="avatar-upload"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
        disabled={uploadAvatar.isPending}
      />

      {/* Upload Button (Mobile) */}
      <div className="mt-4 sm:hidden">
        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadAvatar.isPending}
          isLoading={uploadAvatar.isPending}
        >
          {t('uploadPhoto')}
        </Button>
      </div>
    </div>
  );
}
