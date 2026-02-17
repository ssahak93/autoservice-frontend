'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

interface PhotoViewerProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  alt?: string;
}

/**
 * Simple Photo Viewer Component
 *
 * Displays a single image in a modal without navigation/slider.
 * User can close and select another photo to view.
 */
export function PhotoViewer({ imageUrl, isOpen, onClose, alt }: PhotoViewerProps) {
  const t = useTranslations('myService.photos');

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt || t('viewPhoto', { defaultValue: 'View Photo' })}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/20 p-3 text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95"
        aria-label={t('close', { defaultValue: 'Close' })}
      >
        <X className="h-6 w-6" />
      </button>

      {/* Image Container */}
      <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <Image
          src={imageUrl}
          alt={alt || t('photo', { defaultValue: 'Photo' })}
          width={1200}
          height={800}
          className="max-h-[90vh] w-auto object-contain"
          priority
          unoptimized
          draggable={false}
        />
      </div>
    </div>
  );
}
