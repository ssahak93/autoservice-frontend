'use client';

import { getImageUrl } from '@/lib/utils/file';
import { formatServiceName } from '@/lib/utils/user';
import type { AutoService } from '@/types';

interface ServiceSchemaProps {
  service: AutoService;
}

export function ServiceSchema({ service }: ServiceSchemaProps) {
  const name = formatServiceName(service.companyName, service.firstName, service.lastName);
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://autoserviceconnect.am');

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    description: service.description,
    image: getImageUrl(service, `${baseUrl}/og-image.jpg`),
    address: {
      '@type': 'PostalAddress',
      streetAddress: service.address,
      addressLocality: service.community || '',
      addressRegion: service.region || '',
      addressCountry: 'AM',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: service.latitude,
      longitude: service.longitude,
    },
    ...(service.phoneNumber && { telephone: service.phoneNumber }),
    priceRange: '$$',
    ...(service.averageRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: service.averageRating,
        reviewCount: service.totalReviews || 0,
      },
    }),
    ...(service.workingHours && {
      openingHoursSpecification: Object.entries(service.workingHours)
        .filter(
          ([, hours]) => hours && typeof hours === 'object' && 'open' in hours && 'close' in hours
        )
        .map(([day, hours]) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: day.charAt(0).toUpperCase() + day.slice(1),
          opens: (hours as { open: string; close: string }).open,
          closes: (hours as { open: string; close: string }).close,
        })),
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
