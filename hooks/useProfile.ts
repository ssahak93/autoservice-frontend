'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { authService } from '@/lib/services/auth.service';
import { filesService } from '@/lib/services/files.service';
import { validateFile } from '@/lib/utils/fileValidation';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import type { User } from '@/types';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatarFileId?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();
  const { setUser } = useAuthStore();
  const t = useTranslations('profile');

  return useMutation({
    mutationFn: (data: UpdateProfileData) => authService.updateProfile(data),
    onSuccess: async (updatedUser: User) => {
      // Update user in store
      setUser(updatedUser);
      // Invalidate and refetch user data to get latest avatarUrl
      queryClient.setQueryData(['auth', 'me'], updatedUser);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      // Refetch to ensure we have the latest data including avatarUrl
      await queryClient.refetchQueries({ queryKey: ['auth', 'me'] });
      showToast(t('profileUpdated', { defaultValue: 'Profile updated successfully' }), 'success');
    },
    onError: (error: Error) => {
      showToast(
        error.message || t('updateError', { defaultValue: 'Failed to update profile' }),
        'error'
      );
    },
  });
}

/**
 * Hook to upload avatar
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();
  const { setUser, user } = useAuthStore();
  const t = useTranslations('profile');

  return useMutation({
    mutationFn: async (file: File) => {
      // Validate file
      const validation = validateFile(file, {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/'],
        allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
      });

      if (!validation.isValid) {
        throw new Error(
          validation.error || t('invalidImage', { defaultValue: 'Invalid image file' })
        );
      }

      // Get current user to save old avatarFileId
      const currentUser = user || queryClient.getQueryData<User>(['auth', 'me']);
      const oldAvatarFileId = currentUser?.avatarFileId;

      // Upload new file
      const uploadResult = await filesService.uploadFile(file, 'avatars');

      // Update profile with new avatar directly (don't use useUpdateProfile hook to avoid context issues)
      const updatedUser = await authService.updateProfile({ avatarFileId: uploadResult.id });

      return { uploadResult, updatedUser, oldAvatarFileId };
    },
    onSuccess: async (data) => {
      // Delete old avatar file if it exists and is different from the new one
      if (data.oldAvatarFileId && data.oldAvatarFileId !== data.uploadResult.id) {
        try {
          await filesService.deleteFile(data.oldAvatarFileId);
        } catch (error) {
          // Log error but don't fail the upload if deletion fails
          console.warn('Failed to delete old avatar file:', error);
        }
      }

      // Update user in store with the returned user data
      if (data.updatedUser) {
        setUser(data.updatedUser);
      }
      // Invalidate and refetch to get updated user with avatarUrl
      queryClient.setQueryData(['auth', 'me'], data.updatedUser);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      await queryClient.refetchQueries({ queryKey: ['auth', 'me'] });
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

/**
 * Hook to change password
 */
export function useChangePassword() {
  const { showToast } = useUIStore();
  const t = useTranslations('profile');

  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(data),
    onSuccess: () => {
      showToast(t('passwordChanged', { defaultValue: 'Password changed successfully' }), 'success');
    },
    onError: (error: Error) => {
      showToast(
        error.message || t('passwordChangeError', { defaultValue: 'Failed to change password' }),
        'error'
      );
    },
  });
}
