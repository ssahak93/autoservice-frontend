'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { FILE_CATEGORIES } from '@/lib/constants/file-categories.constants';
import { autoServicesService } from '@/lib/services/auto-services.service';
import { filesService } from '@/lib/services/files.service';
import { validateFile } from '@/lib/utils/fileValidation';
import { useUIStore } from '@/stores/uiStore';

/**
 * Hook to upload auto service avatar
 * Uses the same logic as useUploadAvatar for user profile
 */
export function useUploadAutoServiceAvatar(autoServiceId: string) {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();
  const t = useTranslations('myService.info');

  return useMutation({
    mutationFn: async (file: File) => {
      // Validate file
      const validation = validateFile(file, {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/'],
        allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
      });

      if (!validation.isValid) {
        throw new Error(
          validation.error || t('invalidImage', { defaultValue: 'Invalid image file' })
        );
      }

      // Get current auto service to save old avatarFileId BEFORE any updates
      const currentAutoService = queryClient.getQueryData(['autoService', autoServiceId]) as
        | { avatarFileId?: string }
        | undefined;
      const oldAvatarFileId = currentAutoService?.avatarFileId;

      // If no current service in cache, fetch it
      let oldAvatarFileIdFromService: string | undefined;
      if (!oldAvatarFileId) {
        const services = await autoServicesService.getAvailableAutoServices();
        const service = services.find((s) => s.id === autoServiceId);
        oldAvatarFileIdFromService = service?.avatarFile?.id;
      }

      const oldFileId = oldAvatarFileId || oldAvatarFileIdFromService;

      // Upload new file
      const uploadResult = await filesService.uploadFile(
        file,
        FILE_CATEGORIES.AUTO_SERVICE_AVATARS
      );

      // Delete old avatar file BEFORE updating service to avoid confusion
      // This ensures we delete the correct old file, not the new one
      // Only delete if old file exists and is different from new file
      if (oldFileId && oldFileId !== uploadResult.id) {
        try {
          await filesService.deleteFile(oldFileId);
        } catch (error) {
          // Log error but don't fail the upload if deletion fails
          // Error is silently ignored to not interrupt the upload flow
          console.warn('Failed to delete old avatar file', error);
        }
      }

      // Update service with new avatar
      await autoServicesService.updateAutoService(autoServiceId, {
        avatarFileId: uploadResult.id,
      });

      return { uploadResult };
    },
    onSuccess: async () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['autoService', autoServiceId] });
      queryClient.invalidateQueries({ queryKey: ['availableAutoServices'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      await queryClient.refetchQueries({ queryKey: ['autoService', autoServiceId] });
      showToast(t('avatarUpdated', { defaultValue: 'Avatar updated successfully' }), 'success');
    },
    onError: (error: Error) => {
      showToast(
        error.message || t('avatarUpdateError', { defaultValue: 'Failed to update avatar' }),
        'error'
      );
    },
  });
}
