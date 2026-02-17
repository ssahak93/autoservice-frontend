import type { Metadata } from 'next';

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME || 'autoserviceconnect.am'}`;

export function generateServicesMetadata(locale: string): Metadata {
  const titles = {
    en: 'Auto Services - Find and Book Car Repair Services in Armenia',
    ru: 'Автосервисы - Найдите и забронируйте услуги по ремонту автомобилей в Армении',
    hy: 'Ավտոսպասարկում - Գտեք և ամրագրեք ավտոմեքենաների վերանորոգման ծառայություններ Հայաստանում',
  };

  const descriptions = {
    en: 'Find and book verified auto services in Armenia. Professional car repair, maintenance, and diagnostics. Book your appointment online today!',
    ru: 'Найдите и забронируйте проверенные автосервисы в Армении. Профессиональный ремонт автомобилей, обслуживание и диагностика. Забронируйте визит онлайн сегодня!',
    hy: 'Գտեք և ամրագրեք ստուգված ավտոսպասարկում Հայաստանում: Մասնագիտական ավտոմեքենաների վերանորոգում, սպասարկում և ախտորոշում: Ամրագրեք ձեր այցելությունը առցանց այսօր:',
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
    keywords:
      'auto service, car repair, Armenia, Yerevan, verified service, car maintenance, diagnostics',
    authors: [{ name: process.env.NEXT_PUBLIC_BRAND_NAME || 'Auto Service Connect' }],
    creator: process.env.NEXT_PUBLIC_BRAND_NAME || 'Auto Service Connect',
    publisher: process.env.NEXT_PUBLIC_BRAND_NAME || 'Auto Service Connect',
    openGraph: {
      title: titles[locale as keyof typeof titles] || titles.en,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
      url: `${baseUrl}/${locale}/services`,
      siteName: process.env.NEXT_PUBLIC_BRAND_NAME || 'Auto Service Connect',
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: process.env.NEXT_PUBLIC_BRAND_NAME || 'Auto Service Connect',
        },
      ],
      locale: locale === 'hy' ? 'hy_AM' : locale === 'ru' ? 'ru_RU' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale as keyof typeof titles] || titles.en,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
      images: [`${baseUrl}/og-image.jpg`],
      creator: `@${process.env.NEXT_PUBLIC_TWITTER_HANDLE || 'autoserviceconnect'}`,
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/services`,
      languages: {
        en: `${baseUrl}/en/services`,
        ru: `${baseUrl}/ru/services`,
        hy: `${baseUrl}/hy/services`,
        'x-default': `${baseUrl}/hy/services`,
      },
    },
  };
}
