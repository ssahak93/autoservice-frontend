import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import type { Provider } from '@/types';

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME || 'autoserviceconnect.am'}`;

export async function generateServiceMetadata(
  service: Provider,
  locale: string
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'services.metadata' });
  const name = service.companyName || `${service.firstName} ${service.lastName}`;

  // Build description with translations
  const ratingText = service.averageRating
    ? t('descriptionWithRating', {
        rating: Number(service.averageRating).toFixed(1),
      })
    : '';

  const description =
    service.description ||
    t('description', {
      community: service.community || 'Armenia',
      region: service.region || 'Armenia',
      rating: ratingText,
    });

  const imageUrl = service.avatarFile?.fileUrl || `${baseUrl}/og-image.jpg`;

  const keywords = t('keywords', {
    community: service.community || '',
    region: service.region || '',
    specialization: service.specialization || 'auto repair',
  });

  return {
    title: t('title', { name }),
    description: description.substring(0, 160),
    keywords,
    authors: [{ name: t('siteName') }],
    creator: t('siteName'),
    publisher: t('siteName'),
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: t('title', { name }),
      description: description.substring(0, 160),
      url: `${baseUrl}/${locale}/services/${service.id}`,
      siteName: t('siteName'),
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
      title: t('title', { name }),
      description: description.substring(0, 160),
      images: [imageUrl],
      creator: `@${process.env.NEXT_PUBLIC_TWITTER_HANDLE || 'autoserviceconnect'}`,
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
