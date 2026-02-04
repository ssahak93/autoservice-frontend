'use client';

import { X, GripVertical } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import React, { useState, useRef, useEffect } from 'react';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FileUpload } from '@/components/ui/FileUpload';
import {
  useDeletePhoto,
  useReorderPhotos,
  useUpdateProfilePhotos,
} from '@/hooks/usePhotoMutations';
import { FILE_CATEGORIES } from '@/lib/constants/file-categories.constants';
import {
  type AutoServiceProfile,
  type PhotoItem,
} from '@/lib/services/auto-service-profile.service';
import { type UploadedFile } from '@/lib/services/files.service';

import { PhotoViewer } from './PhotoViewer';

interface PhotoGalleryProps {
  profile: AutoServiceProfile;
}

// Helper to normalize photo items (handle both old string[] and new PhotoItem[] formats)
const normalizePhotos = (photos: PhotoItem[] | string[] | undefined): PhotoItem[] => {
  if (!photos || photos.length === 0) return [];
  return photos.map((photo) => (typeof photo === 'string' ? { id: photo, url: photo } : photo));
};

export function PhotoGallery({ profile: initialProfile }: PhotoGalleryProps) {
  const t = useTranslations('myService.photos');

  const [uploadingType, setUploadingType] = useState<'profile' | 'work' | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<{ url: string; alt: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    fileId: string;
    type: 'profile' | 'work';
  }>({ isOpen: false, fileId: '', type: 'profile' });

  // Local state for photos to allow optimistic updates
  const [localProfile, setLocalProfile] = useState<AutoServiceProfile>(initialProfile);

  // Track if we're dragging to prevent click events
  const wasDraggingRef = useRef(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track if we have pending mutations to prevent overwriting optimistic updates
  const isMutatingRef = useRef(false);

  // Update local profile when prop changes, but only if not mutating
  useEffect(() => {
    if (!isMutatingRef.current) {
      // Only update if the profile actually changed (by comparing photo IDs)
      const currentProfileIds = JSON.stringify({
        profile: normalizePhotos(localProfile.profilePhotoFileIds).map((p) => p.id),
        work: normalizePhotos(localProfile.workPhotoFileIds).map((p) => p.id),
      });
      const newProfileIds = JSON.stringify({
        profile: normalizePhotos(initialProfile.profilePhotoFileIds).map((p) => p.id),
        work: normalizePhotos(initialProfile.workPhotoFileIds).map((p) => p.id),
      });

      // Only update if IDs are different (meaning server data changed)
      // and the new order matches what we expect (to avoid overwriting optimistic updates)
      if (currentProfileIds !== newProfileIds) {
        setLocalProfile(initialProfile);
      }
    }
  }, [initialProfile, localProfile.profilePhotoFileIds, localProfile.workPhotoFileIds]);

  const profilePhotos = normalizePhotos(localProfile.profilePhotoFileIds);
  const workPhotos = normalizePhotos(localProfile.workPhotoFileIds);

  // Use custom hook for updating photos (SOLID - Single Responsibility)
  const updateProfilePhotosMutation = useUpdateProfilePhotos();

  // Use custom hook for delete with optimistic updates (SOLID - Single Responsibility)
  const deleteMutation = useDeletePhoto(
    ({ fileId, type }) => {
      // Mark that we're mutating
      isMutatingRef.current = true;

      // Snapshot the previous value
      const previousProfile = localProfile;

      // Optimistically update the local state
      const updatedProfile = { ...localProfile };
      if (type === 'profile') {
        const currentPhotos = normalizePhotos(localProfile.profilePhotoFileIds);
        updatedProfile.profilePhotoFileIds = currentPhotos.filter((p) => p.id !== fileId);
      } else {
        const currentPhotos = normalizePhotos(localProfile.workPhotoFileIds);
        updatedProfile.workPhotoFileIds = currentPhotos.filter((p) => p.id !== fileId);
      }
      setLocalProfile(updatedProfile);

      return { previousProfile };
    },
    (context) => {
      isMutatingRef.current = false;
      // Rollback to previous state on error
      if (context && typeof context === 'object' && 'previousProfile' in context) {
        setLocalProfile(context.previousProfile as AutoServiceProfile);
      }
    }
  );

  // Use custom hook for reorder with optimistic updates (SOLID - Single Responsibility)
  const reorderMutation = useReorderPhotos(
    ({ fileIds, type }) => {
      // Mark that we're mutating
      isMutatingRef.current = true;

      // Snapshot the previous value
      const previousProfile = localProfile;

      // Optimistically update the local state
      const updatedProfile = { ...localProfile };
      if (type === 'profile') {
        const currentPhotos = normalizePhotos(localProfile.profilePhotoFileIds);
        const reorderedPhotos = fileIds.map((id) => {
          const photo = currentPhotos.find((p) => p.id === id);
          return photo || { id, url: '' };
        });
        updatedProfile.profilePhotoFileIds = reorderedPhotos;
      } else {
        const currentPhotos = normalizePhotos(localProfile.workPhotoFileIds);
        const reorderedPhotos = fileIds.map((id) => {
          const photo = currentPhotos.find((p) => p.id === id);
          return photo || { id, url: '' };
        });
        updatedProfile.workPhotoFileIds = reorderedPhotos;
      }
      setLocalProfile(updatedProfile);

      return { previousProfile };
    },
    (context) => {
      isMutatingRef.current = false;
      // Rollback to previous state on error
      if (context && typeof context === 'object' && 'previousProfile' in context) {
        setLocalProfile(context.previousProfile as AutoServiceProfile);
      }
    }
  );

  const handlePhotoUpload = async (files: UploadedFile[], type: 'profile' | 'work') => {
    setUploadingType(type);
    try {
      const newPhotoIds = files.map((f) => f.id);

      // Get current photo IDs
      const currentPhotos = normalizePhotos(
        type === 'profile' ? localProfile.profilePhotoFileIds : localProfile.workPhotoFileIds
      );
      const currentIds = currentPhotos.map((p) => p.id);

      // Combine existing and new IDs (avoid duplicates, new photos go to the end)
      const allIds = [...new Set([...currentIds, ...newPhotoIds])];

      await updateProfilePhotosMutation.mutateAsync({ newPhotoIds: allIds, type });
    } catch {
      // Error is handled in mutation
    } finally {
      setUploadingType(null);
    }
  };

  const handleDelete = (fileId: string, type: 'profile' | 'work', e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setDeleteConfirm({ isOpen: true, fileId, type });
  };

  const confirmDelete = () => {
    deleteMutation.mutate({ fileId: deleteConfirm.fileId, type: deleteConfirm.type });
    setDeleteConfirm({ isOpen: false, fileId: '', type: 'profile' });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    wasDraggingRef.current = true;
    setDraggedIndex(index);

    // Set drag image to empty transparent image using native Image constructor
    const img = new window.Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number, type: 'profile' | 'work') => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      // Reset dragging flag after a short delay
      setTimeout(() => {
        wasDraggingRef.current = false;
      }, 100);
      return;
    }

    const photos = type === 'profile' ? profilePhotos : workPhotos;
    const newOrder = [...photos];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, removed);

    const fileIds = newOrder.map((photo) => photo.id);
    reorderMutation.mutate({ fileIds, type });

    setDraggedIndex(null);
    setDragOverIndex(null);
    // Reset dragging flag after a short delay
    setTimeout(() => {
      wasDraggingRef.current = false;
    }, 100);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    // Reset dragging flag after a short delay
    setTimeout(() => {
      wasDraggingRef.current = false;
    }, 100);
  };

  const handleImageClick = (
    photo: PhotoItem,
    type: 'profile' | 'work',
    index: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    // Clear any existing timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    // Wait a bit to see if this was part of a drag operation
    clickTimeoutRef.current = setTimeout(() => {
      if (!wasDraggingRef.current) {
        setViewingPhoto({
          url: photo.url,
          alt: `${type === 'profile' ? 'Profile' : 'Work'} photo ${index + 1}`,
        });
      }
    }, 150);
  };

  const renderPhotoGrid = (photos: PhotoItem[], type: 'profile' | 'work') => {
    if (photos.length === 0) {
      return (
        <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('noPhotos', { defaultValue: 'No photos yet' })}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            draggable={draggedIndex === null}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index, type)}
            onDragEnd={handleDragEnd}
            className={`group relative aspect-square overflow-hidden rounded-lg bg-gray-200 transition-all dark:bg-gray-700 ${
              draggedIndex === index ? 'scale-95 cursor-grabbing opacity-50' : 'cursor-grab'
            } ${dragOverIndex === index ? 'z-40 scale-105 ring-2 ring-primary-500' : ''} ${
              draggedIndex !== null && draggedIndex !== index ? 'opacity-70' : ''
            }`}
          >
            {/* Image - clickable to view */}
            <div
              onClick={(e) => handleImageClick(photo, type, index, e)}
              className="absolute inset-0 z-0"
            >
              <Image
                src={photo.url}
                alt={`${type === 'profile' ? 'Profile' : 'Work'} photo ${index + 1}`}
                fill
                className="pointer-events-none object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                loading="eager"
                unoptimized
                draggable={false}
              />
            </div>

            {/* Overlay with controls */}
            <div className="pointer-events-none absolute inset-0 z-10 bg-black/0 transition-all group-hover:bg-black/50">
              <div className="pointer-events-auto flex h-full items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(photo.id, type, e)}
                  disabled={deleteMutation.isPending}
                  className="z-20 rounded-full bg-red-500/90 p-1.5 text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                  aria-label={t('delete', { defaultValue: 'Delete' })}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Drag handle indicator */}
            {draggedIndex === null && (
              <div
                className="pointer-events-none absolute left-2 top-2 z-20 rounded bg-black/50 p-1.5 opacity-70 transition-opacity group-hover:opacity-100"
                aria-label={t('dragToReorder', { defaultValue: 'Drag to reorder' })}
              >
                <GripVertical className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          {t('title', { defaultValue: 'Photo Gallery' })}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('description', { defaultValue: 'Manage your profile and work photos' })}
        </p>
      </div>

      {/* Profile Photos */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {t('profilePhotos', { defaultValue: 'Profile Photos' })}
        </h3>
        <FileUpload
          accept="image/*"
          maxSize={10}
          maxFiles={10}
          multiple={true}
          label={t('uploadProfilePhotos', { defaultValue: 'Upload Profile Photos' })}
          category={FILE_CATEGORIES.PROFILE_PHOTOS}
          inputId="profile-photos-upload-input"
          onUpload={(files) => handlePhotoUpload(files, 'profile')}
          disabled={uploadingType === 'profile' || updateProfilePhotosMutation.isPending}
        />
        {profilePhotos.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('existingPhotos', { defaultValue: 'Existing Photos' })} ({profilePhotos.length})
            </p>
            {renderPhotoGrid(profilePhotos, 'profile')}
          </div>
        )}
      </div>

      {/* Work Photos */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {t('workPhotos', { defaultValue: 'Work Photos' })}
        </h3>
        <FileUpload
          accept="image/*"
          maxSize={10}
          maxFiles={20}
          multiple={true}
          label={t('uploadWorkPhotos', { defaultValue: 'Upload Work Photos' })}
          category={FILE_CATEGORIES.WORK_PHOTOS}
          inputId="work-photos-upload-input"
          onUpload={(files) => handlePhotoUpload(files, 'work')}
          disabled={uploadingType === 'work' || updateProfilePhotosMutation.isPending}
        />
        {workPhotos.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('existingPhotos', { defaultValue: 'Existing Photos' })} ({workPhotos.length})
            </p>
            {renderPhotoGrid(workPhotos, 'work')}
          </div>
        )}
      </div>

      {/* Photo Viewer Modal */}
      {viewingPhoto && (
        <PhotoViewer
          imageUrl={viewingPhoto.url}
          isOpen={!!viewingPhoto}
          onClose={() => setViewingPhoto(null)}
          alt={viewingPhoto.alt}
        />
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, fileId: '', type: 'profile' })}
        onConfirm={confirmDelete}
        title={t('delete', { defaultValue: 'Delete Photo' })}
        message={t('deleteConfirm', {
          defaultValue: 'Are you sure you want to delete this photo?',
        })}
        variant="danger"
        confirmText={t('delete', { defaultValue: 'Delete' })}
        cancelText={t('cancel', { defaultValue: 'Cancel' })}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
