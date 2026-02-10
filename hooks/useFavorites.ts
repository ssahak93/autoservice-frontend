'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { queryKeys, queryConfig } from '@/lib/api/query-config';
import { unwrapResponseData, unwrapArrayResponse } from '@/lib/utils/api-response';
import { useUIStore } from '@/stores/uiStore';
import type { AutoService } from '@/types';

interface Favorite {
  id: string;
  userId: string;
  autoServiceProfileId: string;
  createdAt: string;
  autoServiceProfile?: {
    autoService: AutoService;
  };
}

export const useFavorites = () => {
  return useQuery<Favorite[]>({
    queryKey: queryKeys.favorites(),
    queryFn: async () => {
      const response = await apiClient.get<Favorite[] | { success: boolean; data: Favorite[] }>(
        API_ENDPOINTS.FAVORITES.LIST
      );
      return unwrapArrayResponse(response);
    },
    staleTime: queryConfig.staleTime,
    gcTime: queryConfig.gcTime,
  });
};

export const useIsFavorited = (profileId: string | null) => {
  return useQuery<boolean>({
    queryKey: queryKeys.favorite(profileId || ''),
    queryFn: async () => {
      if (!profileId) return false;
      const response = await apiClient.get<
        { isFavorited: boolean } | { success: boolean; data: { isFavorited: boolean } }
      >(API_ENDPOINTS.FAVORITES.CHECK(profileId));
      const data = unwrapResponseData(response);
      return data.isFavorited;
    },
    enabled: !!profileId,
    staleTime: queryConfig.staleTime,
  });
};

export const useAddToFavorites = () => {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();
  const t = useTranslations('favorites');

  return useMutation({
    mutationFn: async (profileId: string) => {
      const response = await apiClient.post<Favorite | { success: boolean; data: Favorite }>(
        API_ENDPOINTS.FAVORITES.ADD(profileId)
      );
      return unwrapResponseData(response);
    },
    onMutate: async (profileId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites() });
      await queryClient.cancelQueries({ queryKey: queryKeys.favorite(profileId) });

      // Snapshot previous values
      const previousFavorites = queryClient.getQueryData<Favorite[]>(queryKeys.favorites());
      const previousIsFavorited = queryClient.getQueryData<boolean>(queryKeys.favorite(profileId));

      // Optimistically update
      queryClient.setQueryData<Favorite[]>(queryKeys.favorites(), (old) => {
        if (!old) return old;
        // Create temporary favorite
        const tempFavorite: Favorite = {
          id: `temp-${Date.now()}`,
          userId: '',
          autoServiceProfileId: profileId,
          createdAt: new Date().toISOString(),
        };
        return [...old, tempFavorite];
      });

      queryClient.setQueryData<boolean>(queryKeys.favorite(profileId), () => true);

      return { previousFavorites, previousIsFavorited };
    },
    onSuccess: (data, profileId) => {
      // Replace temporary favorite with real one
      queryClient.setQueryData<Favorite[]>(queryKeys.favorites(), (old) => {
        if (!old) return old;
        return old.map((fav) =>
          fav.id.startsWith('temp-') && fav.autoServiceProfileId === profileId ? data : fav
        );
      });
      showToast(t('addedToFavorites', { defaultValue: 'Added to favorites' }), 'success');
    },
    onError: (_error, profileId, context) => {
      // Rollback on error
      if (context?.previousFavorites) {
        queryClient.setQueryData(queryKeys.favorites(), context.previousFavorites);
      }
      if (context?.previousIsFavorited !== undefined) {
        queryClient.setQueryData(queryKeys.favorite(profileId), context.previousIsFavorited);
      }
      showToast(t('failedToAdd', { defaultValue: 'Failed to add to favorites' }), 'error');
    },
    onSettled: (data, _error, profileId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites() });
      queryClient.invalidateQueries({ queryKey: queryKeys.favorite(profileId) });
    },
  });
};

export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient();
  const { showToast } = useUIStore();
  const t = useTranslations('favorites');

  return useMutation({
    mutationFn: async (profileId: string) => {
      await apiClient.delete(API_ENDPOINTS.FAVORITES.REMOVE(profileId));
    },
    onMutate: async (profileId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites() });
      await queryClient.cancelQueries({ queryKey: queryKeys.favorite(profileId) });

      const previousFavorites = queryClient.getQueryData<Favorite[]>(queryKeys.favorites());
      const previousIsFavorited = queryClient.getQueryData<boolean>(queryKeys.favorite(profileId));

      // Optimistically update
      queryClient.setQueryData<Favorite[]>(queryKeys.favorites(), (old) => {
        if (!old) return old;
        return old.filter((fav) => fav.autoServiceProfileId !== profileId);
      });

      queryClient.setQueryData<boolean>(queryKeys.favorite(profileId), () => false);

      return { previousFavorites, previousIsFavorited };
    },
    onSuccess: () => {
      showToast(t('removedFromFavorites', { defaultValue: 'Removed from favorites' }), 'success');
    },
    onError: (_error, profileId, context) => {
      // Rollback on error
      if (context?.previousFavorites) {
        queryClient.setQueryData(queryKeys.favorites(), context.previousFavorites);
      }
      if (context?.previousIsFavorited !== undefined) {
        queryClient.setQueryData(queryKeys.favorite(profileId), context.previousIsFavorited);
      }
      showToast(t('failedToRemove', { defaultValue: 'Failed to remove from favorites' }), 'error');
    },
    onSettled: (_data, _error, profileId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites() });
      queryClient.invalidateQueries({ queryKey: queryKeys.favorite(profileId) });
    },
  });
};
