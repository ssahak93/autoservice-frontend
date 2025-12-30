'use client';

import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ServiceMapProps {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  name: string;
}

export function ServiceMap({ latitude, longitude, address, city, name }: ServiceMapProps) {
  const t = useTranslations('services');

  // Generate Google Maps embed URL
  const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}&hl=en&output=embed`;

  return (
    <div className="mb-8">
      <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-semibold">
        <MapPin className="h-6 w-6" />
        <span>{t('location')}</span>
      </h2>
      <div className="overflow-hidden rounded-lg border-2 border-neutral-200">
        <div className="relative h-64 w-full md:h-96">
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`${t('map')} - ${name}`}
            className="absolute inset-0"
          />
        </div>
        <div className="border-t border-neutral-200 bg-neutral-50 p-4">
          <p className="text-sm font-medium text-neutral-700">
            {address}, {city}
          </p>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 text-sm text-primary-600 transition-colors hover:text-primary-700"
          >
            <MapPin className="h-4 w-4" />
            {t('getDirections')}
          </a>
        </div>
      </div>
    </div>
  );
}
