'use client';

import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface ServiceGalleryProps {
  profilePhotos?: string[];
  workPhotos?: string[];
}

export function ServiceGallery({ profilePhotos = [], workPhotos = [] }: ServiceGalleryProps) {
  const t = useTranslations('services');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const allPhotos = [...profilePhotos, ...workPhotos];

  if (allPhotos.length === 0) {
    return null;
  }

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setSelectedImage(allPhotos[index]);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      const newIndex = selectedIndex > 0 ? selectedIndex - 1 : allPhotos.length - 1;
      setSelectedIndex(newIndex);
      setSelectedImage(allPhotos[newIndex]);
    } else {
      const newIndex = selectedIndex < allPhotos.length - 1 ? selectedIndex + 1 : 0;
      setSelectedIndex(newIndex);
      setSelectedImage(allPhotos[newIndex]);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="mb-4 font-display text-2xl font-semibold">{t('gallery')}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {allPhotos.map((photo, index) => (
            <button
              key={index}
              onClick={() => openLightbox(index)}
              className="group relative aspect-square overflow-hidden rounded-lg transition-transform hover:scale-105"
              aria-label={t('viewImage')}
            >
              <Image
                src={photo}
                alt={`${t('galleryImage')} ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={t('imageViewer')}
        >
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label={t('close')}
          >
            <X className="h-6 w-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateImage('prev');
            }}
            className="absolute left-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label={t('previousImage')}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateImage('next');
            }}
            className="absolute right-16 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label={t('nextImage')}
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={selectedImage}
              alt={`${t('galleryImage')} ${selectedIndex + 1}`}
              width={1200}
              height={800}
              className="max-h-[90vh] w-auto object-contain"
              priority
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-white">
            {selectedIndex + 1} / {allPhotos.length}
          </div>
        </div>
      )}
    </>
  );
}
