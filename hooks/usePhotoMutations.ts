'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { autoServiceProfileService } from '@/lib/services/auto-service-profile.service';
import { getMutationErrorMessage } from '@/lib/utils/mutation-helpers';
import { useAutoServiceStore } from '@/stores/autoServiceStore';
import { useUIStore } from '@/stores/uiStore';

/**
 * Hook for photo mutations
 * Follows Single Responsibility Principle - handles only photo mutation logic
 * @param onMutate - Optional callback for optimistic updates
 * @param onErrorRollback - Optional callback to rollback on error
 */
export function useDeletePhoto(
  onMutate?: (variables: { fileId: string; type: 'profile' | 'work' }) => unknown,
  onErrorRollback?: (context: unknown) => void
) {
  const t = useTranslations('myService.photos');
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();
  const { selectedAutoServiceId } = useAutoServiceStore();

  return useMutation({
    mutationFn: ({ fileId, type }: { fileId: string; type: 'profile' | 'work' }) =>
      autoServiceProfileService.deletePhoto(fileId, type, selectedAutoServiceId || undefined),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['autoServiceProfile'] });

      // Call custom onMutate if provided
      const context = onMutate ? onMutate(variables) : undefined;
      return context;
    },
    onSuccess: () => {
      showToast(t('deleteSuccess', { defaultValue: 'Photo deleted successfully' }), 'success');
      queryClient.invalidateQueries({ queryKey: ['autoServiceProfile'] });
      // Note: isMutatingRef should be reset by component after delay
    },
    onError: (error: unknown, variables, context) => {
      // Rollback if callback provided
      if (onErrorRollback && context) {
        onErrorRollback(context);
      }

      const errorMessage = getMutationErrorMessage(
        error,
        t('deleteError', { defaultValue: 'Failed to delete photo' })
      );
      showToast(errorMessage, 'error');
    },
  });
}

/**
 * Hook for reordering photos with optimistic updates support
 * @param onMutate - Optional callback for optimistic updates
 * @param onErrorRollback - Optional callback to rollback on error
 */
export function useReorderPhotos(
  onMutate?: (variables: { fileIds: string[]; type: 'profile' | 'work' }) => unknown,
  onErrorRollback?: (context: unknown) => void
) {
  const t = useTranslations('myService.photos');
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();
  const { selectedAutoServiceId } = useAutoServiceStore();

  return useMutation({
    mutationFn: ({ fileIds, type }: { fileIds: string[]; type: 'profile' | 'work' }) =>
      autoServiceProfileService.reorderPhotos(fileIds, type, selectedAutoServiceId || undefined),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['autoServiceProfile'] });

      // Call custom onMutate if provided
      const context = onMutate ? onMutate(variables) : undefined;
      return context;
    },
    onSuccess: () => {
      showToast(t('reorderSuccess', { defaultValue: 'Photos reordered successfully' }), 'success');
      queryClient.invalidateQueries({ queryKey: ['autoServiceProfile'] });
      // Note: isMutatingRef should be reset by component after delay
    },
    onError: (error: unknown, variables, context) => {
      // Rollback if callback provided
      if (onErrorRollback && context) {
        onErrorRollback(context);
      }

      const errorMessage = getMutationErrorMessage(
        error,
        t('reorderError', { defaultValue: 'Failed to reorder photos' })
      );
      showToast(errorMessage, 'error');
    },
  });
}

/**
 * Hook for updating profile photos (add new photos)
 * Note: newPhotoIds should already include existing IDs (combined in component)
 */
export function useUpdateProfilePhotos() {
  const t = useTranslations('myService.photos');
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();
  const { selectedAutoServiceId } = useAutoServiceStore();

  return useMutation({
    mutationFn: ({ newPhotoIds, type }: { newPhotoIds: string[]; type: 'profile' | 'work' }) => {
      // Use reorderPhotos endpoint which handles both adding and reordering
      // newPhotoIds should already include existing IDs (combined in component)
      return autoServiceProfileService.reorderPhotos(
        newPhotoIds,
        type,
        selectedAutoServiceId || undefined
      );
    },
    onSuccess: () => {
      showToast(t('uploadSuccess', { defaultValue: 'Photos uploaded successfully' }), 'success');
      queryClient.invalidateQueries({ queryKey: ['autoServiceProfile'] });
    },
    onError: (error: unknown) => {
      const errorMessage = getMutationErrorMessage(
        error,
        t('uploadError', { defaultValue: 'Failed to upload photos' })
      );
      showToast(errorMessage, 'error');
    },
  });
}
