'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { ServiceCardSkeleton } from '@/components/auto-service';
import { ServiceCard } from '@/components/services/ServiceCard';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Link } from '@/i18n/routing';
import { recommendationsService } from '@/lib/services/recommendations.service';

interface RecommendationsSectionProps {
  locale: string;
}

/**
 * RecommendationsSection Component
 *
 * Отображает рекомендации услуг на главной странице
 */
export function RecommendationsSection({ locale }: RecommendationsSectionProps) {
  const t = useTranslations('home');
  const geolocation = useGeolocation();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['recommendations', geolocation.state.latitude, geolocation.state.longitude],
    queryFn: async () => {
      return recommendationsService.getRecommendations({
        lat: geolocation.state.latitude,
        lng: geolocation.state.longitude,
      });
    },
    enabled: true, // Всегда загружаем рекомендации
    staleTime: 5 * 60 * 1000, // 5 минут
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-neutral-900">
            {t('recommendationsTitle', { defaultValue: 'Best Services for You' })}
          </h2>
          <p className="mt-2 text-neutral-600">
            {t('recommendationsSubtitle', {
              defaultValue: 'Top-rated services in your area',
            })}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold text-neutral-900">
          {t('recommendationsTitle', { defaultValue: 'Best Services for You' })}
        </h2>
        <p className="mt-2 text-neutral-600">
          {t('recommendationsSubtitle', {
            defaultValue: 'Top-rated services in your area',
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.slice(0, 6).map((service) => (
          <ServiceCard key={service.id} service={service} locale={locale} />
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/services"
          className="inline-block rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-700"
        >
          {t('viewAllServices', { defaultValue: 'View All Services' })}
        </Link>
      </div>
    </div>
  );
}
