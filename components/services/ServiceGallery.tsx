'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ImageLightbox } from '@/components/common/ImageLightbox';

interface ServiceGalleryProps {
  profilePhotos?: string[];
  workPhotos?: string[];
}

interface PhotoGalleryProps {
  photos: string[];
  title: string;
  onImageClick: (index: number) => void;
}

/**
 * PhotoGallery Component
 *
 * Single Responsibility: Displays a grid of photos for a specific category
 */
function PhotoGallery({ photos, title, onImageClick }: PhotoGalleryProps) {
  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 sm:mb-8">
      <h3 className="mb-3 font-display text-lg font-semibold sm:mb-4 sm:text-xl">{title}</h3>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {photos.map((photo, index) => (
          <button
            key={index}
            onClick={() => onImageClick(index)}
            className="group relative aspect-square overflow-hidden rounded-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={`${title} - ${index + 1}`}
          >
            <Image
              src={photo}
              alt={`${title} ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * ServiceGallery Component
 *
 * Single Responsibility: Manages service photo galleries (profile and work photos)
 * Open/Closed: Can be extended with new photo types without modifying core logic
 */
export function ServiceGallery({ profilePhotos = [], workPhotos = [] }: ServiceGalleryProps) {
  const t = useTranslations('services');
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    images: string[];
    initialIndex: number;
    title: string;
  }>({
    isOpen: false,
    images: [],
    initialIndex: 0,
    title: '',
  });

  const allPhotos = [...profilePhotos, ...workPhotos];

  if (allPhotos.length === 0) {
    return null;
  }

  const openLightbox = (index: number, photos: string[], title: string) => {
    setLightboxState({
      isOpen: true,
      images: photos,
      initialIndex: index,
      title,
    });
  };

  const closeLightbox = () => {
    setLightboxState({
      isOpen: false,
      images: [],
      initialIndex: 0,
      title: '',
    });
  };

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h2 className="mb-4 font-display text-xl font-semibold sm:text-2xl">{t('gallery')}</h2>

        {/* Profile Photos Gallery */}
        <PhotoGallery
          photos={profilePhotos}
          title={t('profilePhotos')}
          onImageClick={(index) => openLightbox(index, profilePhotos, t('profilePhotos'))}
        />

        {/* Work Photos Gallery */}
        <PhotoGallery
          photos={workPhotos}
          title={t('workPhotos')}
          onImageClick={(index) => openLightbox(index, workPhotos, t('workPhotos'))}
        />
      </div>

      {/* Lightbox */}
      <ImageLightbox
        images={lightboxState.images}
        initialIndex={lightboxState.initialIndex}
        isOpen={lightboxState.isOpen}
        onClose={closeLightbox}
        title={lightboxState.title}
      />
    </>
  );
}
