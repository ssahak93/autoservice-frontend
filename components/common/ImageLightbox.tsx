'use client';

import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

/**
 * ImageLightbox Component
 *
 * Displays images in a full-screen lightbox with navigation.
 * Follows SOLID principles:
 * - Single Responsibility: Only handles image lightbox display and navigation
 * - Open/Closed: Can be extended with new features without modifying core logic
 */
export function ImageLightbox({
  images,
  initialIndex,
  isOpen,
  onClose,
  title,
}: ImageLightboxProps) {
  const t = useTranslations('services');
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Navigation function - defined early so it can be used in useEffect
  const navigateImage = useCallback(
    (direction: 'prev' | 'next') => {
      if (images.length === 0) return;

      setDragOffset({ x: 0, y: 0 }); // Reset drag offset when navigating

      if (direction === 'prev') {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    },
    [images.length]
  );

  // Update current index when initialIndex changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, images.length - 1)));
      setDragOffset({ x: 0, y: 0 });
    }
  }, [initialIndex, isOpen, images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        navigateImage('prev');
      } else if (e.key === 'ArrowRight') {
        navigateImage('next');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, navigateImage, onClose]);

  // Touch/Mouse drag handlers
  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;

    const deltaX = clientX - dragStart.x;

    // Only allow horizontal dragging
    setDragOffset({ x: deltaX, y: 0 });
  };

  const handleDragEnd = () => {
    if (!isDragging) return;

    const threshold = 100; // Minimum drag distance to trigger navigation

    if (Math.abs(dragOffset.x) > threshold) {
      if (dragOffset.x > 0) {
        navigateImage('prev');
      } else {
        navigateImage('next');
      }
    }

    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragMove(touch.clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleDragMove(e.clientX);
    }
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  if (!isOpen || images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || t('imageViewer')}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/20 p-3 text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95"
        aria-label={t('close')}
      >
        <X className="h-6 w-6" />
      </button>

      {/* Navigation Buttons - Always visible when multiple images */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateImage('prev');
            }}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95"
            aria-label={t('previousImage')}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateImage('next');
            }}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95"
            aria-label={t('nextImage')}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Image Container */}
      <div
        className="relative max-h-[90vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          transform: `translateX(${dragOffset.x}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        <Image
          src={currentImage}
          alt={title ? `${title} ${currentIndex + 1}` : `${t('galleryImage')} ${currentIndex + 1}`}
          width={1200}
          height={800}
          className="max-h-[90vh] w-auto object-contain"
          priority
          unoptimized
          draggable={false}
        />
      </div>

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-md">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Thumbnail Navigation (for multiple images) */}
      {images.length > 1 && images.length <= 10 && (
        <div className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 gap-2 overflow-x-auto px-4 pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
                setDragOffset({ x: 0, y: 0 });
              }}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                index === currentIndex
                  ? 'scale-110 border-white'
                  : 'border-white/30 opacity-60 hover:opacity-100'
              }`}
              aria-label={`${t('viewImage')} ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${title || t('galleryImage')} ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
