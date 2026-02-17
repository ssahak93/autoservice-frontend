'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { FILE_CATEGORIES } from '@/lib/constants/file-categories.constants';
import { filesService } from '@/lib/services/files.service';
import { providersService } from '@/lib/services/providers.service';
import { validateFile } from '@/lib/utils/fileValidation';
import { useUIStore } from '@/stores/uiStore';

/**
 * Hook to upload provider avatar
 * Uses the same logic as useUploadAvatar for user profile
 */
export function useUploadProviderAvatar(providerId: string) {
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

      // Get current provider to save old avatarFileId BEFORE any updates
      const currentProvider = queryClient.getQueryData(['provider', providerId]) as
        | { avatarFileId?: string }
        | undefined;
      const oldAvatarFileId = currentProvider?.avatarFileId;

      // If no current provider in cache, fetch it
      let oldAvatarFileIdFromService: string | undefined;
      if (!oldAvatarFileId) {
        const providers = await providersService.getAvailableProviders();
        const provider = providers.find((p) => p.id === providerId);
        oldAvatarFileIdFromService = provider?.avatarFile?.id;
      }

      const oldFileId = oldAvatarFileId || oldAvatarFileIdFromService;

      // Upload new file
      const uploadResult = await filesService.uploadFile(file, FILE_CATEGORIES.PROVIDER_AVATARS);

      // Delete old avatar file BEFORE updating provider to avoid confusion
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

      // Update provider with new avatar
      await providersService.updateProvider(providerId, {
        avatarFileId: uploadResult.id,
      });

      return { uploadResult };
    },
    onSuccess: async () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['provider', providerId] });
      queryClient.invalidateQueries({ queryKey: ['availableProviders'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      await queryClient.refetchQueries({ queryKey: ['provider', providerId] });
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
