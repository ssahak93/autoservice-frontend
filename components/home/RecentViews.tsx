'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { useAuth } from '@/hooks/useAuth';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Link } from '@/i18n/routing';
import { historyService } from '@/lib/services/history.service';
import { getAvatarUrl } from '@/lib/utils/file';

/**
 * RecentViews Component
 *
 * Отображает недавно просмотренные услуги
 */
export function RecentViews() {
  const t = useTranslations('home');
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { isEnabled: extendedHistoryEnabled } = useFeatureFlag('extended_search_history', true);

  const { data: views, isLoading } = useQuery({
    queryKey: ['recentViews'],
    queryFn: () => historyService.getRecentViews(6),
    enabled: extendedHistoryEnabled && isAuthenticated, // Загружаем только если feature flag включен И пользователь залогинен
  });

  const clearMutation = useMutation({
    mutationFn: () => historyService.clearViewHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recentViews'] });
    },
  });

  if (isLoading || !views || views.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">
          {t('recentViews', { defaultValue: 'Recently Viewed' })}
        </h3>
        <button
          onClick={() => clearMutation.mutate()}
          className="text-sm text-neutral-500 hover:text-neutral-700"
        >
          {t('clear', { defaultValue: 'Clear' })}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {views.map((view) => {
          const service = view.autoServiceProfile?.autoService;
          if (!service) return null;

          const name =
            service.companyName || `${service.firstName} ${service.lastName}` || 'Service';
          const avatarUrl = getAvatarUrl(service);

          return (
            <Link
              key={view.id}
              href={`/services/${service.id}`}
              className="group flex flex-col items-center gap-2 rounded-lg p-3 transition-colors hover:bg-neutral-100"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-full">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-primary-100 text-primary-600">
                    <span className="text-xl font-bold">{name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <span className="line-clamp-2 text-center text-xs font-medium text-neutral-700 group-hover:text-primary-600">
                {name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
