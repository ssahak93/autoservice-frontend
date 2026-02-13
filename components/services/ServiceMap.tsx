'use client';

import { MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

// Dynamically import Yandex Maps to avoid SSR issues
const YMaps = dynamic(() => import('@pbe/react-yandex-maps').then((mod) => mod.YMaps), {
  ssr: false,
});
const YMap = dynamic(() => import('@pbe/react-yandex-maps').then((mod) => mod.Map), {
  ssr: false,
});
const Placemark = dynamic(() => import('@pbe/react-yandex-maps').then((mod) => mod.Placemark), {
  ssr: false,
});

interface ServiceMapProps {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  name: string;
}

export function ServiceMap({ latitude, longitude, address, city, name }: ServiceMapProps) {
  const t = useTranslations('services');
  const [mounted, setMounted] = useState(false);

  // Yandex Maps API Key
  const YANDEX_MAPS_API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || '';

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="mb-8">
      <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-semibold">
        <MapPin className="h-6 w-6" />
        <span>{t('location')}</span>
      </h2>
      <div className="overflow-hidden rounded-lg border-2 border-neutral-200">
        <div className="relative h-48 w-full sm:h-64 md:h-96">
          {mounted && YANDEX_MAPS_API_KEY ? (
            <YMaps query={{ apikey: YANDEX_MAPS_API_KEY, lang: 'en_US' }}>
              <YMap
                defaultState={{
                  center: [latitude, longitude],
                  zoom: 15,
                }}
                width="100%"
                height="100%"
                modules={['control.ZoomControl', 'control.FullscreenControl']}
                options={{
                  suppressMapOpenBlock: true,
                }}
              >
                <Placemark
                  geometry={[latitude, longitude]}
                  properties={{
                    balloonContent: `
                      <div style="padding: 12px; font-family: system-ui, -apple-system, sans-serif;">
                        <div style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">${name}</div>
                        <div style="font-size: 14px; color: #4b5563;">${address}</div>
                        <div style="font-size: 14px; color: #4b5563;">${city}</div>
                      </div>
                    `,
                    hintContent: name,
                  }}
                  options={{
                    preset: 'islands#blueIcon',
                    iconColor: '#3b82f6',
                  }}
                />
              </YMap>
            </YMaps>
          ) : mounted && !YANDEX_MAPS_API_KEY ? (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-50">
              <div className="p-4 text-center">
                <MapPin className="mx-auto mb-2 h-12 w-12 text-neutral-400" />
                <p className="text-sm text-neutral-600">
                  {t('mapApiKeyRequired', { defaultValue: 'Yandex Maps API key is required' })}
                </p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-50">
              <div className="text-sm text-neutral-500">Loading map...</div>
            </div>
          )}
        </div>
        <div className="border-t border-neutral-200 bg-neutral-50 p-4">
          <p className="text-sm font-medium text-neutral-700">
            {address}, {city}
          </p>
          <div className="mt-2 flex gap-2">
            <a
              href={`https://yandex.com/maps/?pt=${longitude},${latitude}&z=15&l=map`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary-600 transition-colors hover:text-primary-700"
            >
              <MapPin className="h-4 w-4" />
              {t('getDirections', { defaultValue: 'Get Directions' })} (Yandex)
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary-600 transition-colors hover:text-primary-700"
            >
              <MapPin className="h-4 w-4" />
              {t('getDirections', { defaultValue: 'Get Directions' })} (Google)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
