import type { Metadata } from 'next';

import type { AutoService } from '@/types';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'https://autoserviceconnect.am';

export async function generateServiceMetadata(
  service: AutoService,
  locale: string
): Promise<Metadata> {
  const name = service.companyName || `${service.firstName} ${service.lastName}`;
  const description =
    service.description ||
    `Professional auto service in ${service.city}, ${service.region}. Book your appointment online. Verified service provider${service.averageRating ? ` with ${service.averageRating.toFixed(1)} rating` : ''}.`;
  const imageUrl = service.avatarFile?.fileUrl || `${baseUrl}/og-image.jpg`;

  return {
    title: `${name} - Auto Service Connect`,
    description: description.substring(0, 160),
    keywords: [
      'auto service',
      'car repair',
      service.city,
      service.region,
      'Armenia',
      'verified service',
      service.specialization || 'auto repair',
    ].filter(Boolean).join(', '),
    authors: [{ name: 'Auto Service Connect' }],
    creator: 'Auto Service Connect',
    publisher: 'Auto Service Connect',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: `${name} - Auto Service Connect`,
      description: description.substring(0, 160),
      url: `${baseUrl}/${locale}/services/${service.id}`,
      siteName: 'Auto Service Connect',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
      locale: locale === 'hy' ? 'hy_AM' : locale === 'ru' ? 'ru_RU' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} - Auto Service Connect`,
      description: description.substring(0, 160),
      images: [imageUrl],
      creator: '@autoserviceconnect',
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/services/${service.id}`,
      languages: {
        en: `${baseUrl}/en/services/${service.id}`,
        ru: `${baseUrl}/ru/services/${service.id}`,
        hy: `${baseUrl}/hy/services/${service.id}`,
        'x-default': `${baseUrl}/hy/services/${service.id}`,
      },
    },
  };
}

