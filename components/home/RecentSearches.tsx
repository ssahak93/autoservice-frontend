'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useAuth } from '@/hooks/useAuth';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { useRouter } from '@/i18n/routing';
import { historyService } from '@/lib/services/history.service';

/**
 * RecentSearches Component
 *
 * Отображает недавние поиски пользователя
 */
export function RecentSearches() {
  const t = useTranslations('home');
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { isEnabled: extendedHistoryEnabled } = useFeatureFlag('extended_search_history', true);

  const { data: searches, isLoading } = useQuery({
    queryKey: ['recentSearches'],
    queryFn: () => historyService.getRecentSearches(5),
    enabled: extendedHistoryEnabled && isAuthenticated, // Загружаем только если feature flag включен И пользователь залогинен
  });

  const clearMutation = useMutation({
    mutationFn: () => historyService.clearSearchHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recentSearches'] });
    },
  });

  if (isLoading || !searches || searches.length === 0) {
    return null;
  }

  const handleSearchClick = (search: (typeof searches)[0]) => {
    const params = new URLSearchParams();
    if (search.query) params.set('query', search.query);
    if (search.city) params.set('city', search.city);
    if (search.region) params.set('region', search.region);
    if (search.district) params.set('district', search.district);
    if (search.serviceType) params.set('serviceType', search.serviceType);

    // router из next-intl автоматически добавляет locale префикс
    router.push(`/services?${params.toString()}`);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-700">
          {t('recentSearches', { defaultValue: 'Recent Searches' })}
        </h3>
        <button
          onClick={() => clearMutation.mutate()}
          className="text-xs text-neutral-500 hover:text-neutral-700"
        >
          {t('clear', { defaultValue: 'Clear' })}
        </button>
      </div>
      <div className="space-y-1">
        {searches.map((search) => (
          <button
            key={search.id}
            onClick={() => handleSearchClick(search)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-neutral-600 transition-colors hover:bg-neutral-100"
          >
            <Clock className="h-4 w-4 flex-shrink-0 text-neutral-400" />
            <span className="flex-1 truncate">
              {search.query || search.city || t('search', { defaultValue: 'Search' })}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
