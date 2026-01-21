'use client';

import { useEffect, useRef } from 'react';

import { ReviewList } from '@/components/reviews/ReviewList';
import { trackingService } from '@/lib/services/tracking.service';

interface ServiceDetailClientProps {
  serviceId: string;
  profileId: string; // AutoServiceProfile ID для трекинга
}

/**
 * Client component for service detail page interactive parts
 * This allows server-side rendering of the main content while keeping
 * interactive parts (like reviews) as client components
 */
export function ServiceDetailClient({ serviceId, profileId }: ServiceDetailClientProps) {
  const viewStartTimeRef = useRef<number>(Date.now());
  const hasTrackedRef = useRef(false);

  // Трекинг просмотра при монтировании компонента
  useEffect(() => {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;

    // Сохраняем начальное время в переменную для использования в cleanup
    const startTime = viewStartTimeRef.current;

    // Отслеживаем просмотр сразу
    trackingService.trackView(profileId).catch(() => {
      // Игнорируем ошибки трекинга
    });

    // При размонтировании рассчитываем длительность просмотра
    return () => {
      const viewDuration = Math.floor((Date.now() - startTime) / 1000); // в секундах
      if (viewDuration > 3) {
        // Отслеживаем только если просмотр был дольше 3 секунд
        trackingService.trackView(profileId, viewDuration).catch(() => {
          // Игнорируем ошибки трекинга
        });
      }
    };
  }, [profileId]);

  return <ReviewList serviceId={serviceId} />;
}
