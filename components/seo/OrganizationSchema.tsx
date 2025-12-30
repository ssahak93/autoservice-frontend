'use client';

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Auto Service Connect',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://autoserviceconnect.am',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://autoserviceconnect.am'}/logo.png`,
    description: 'Find and book the best auto services in Armenia',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['en', 'ru', 'hy'],
    },
    sameAs: [
      // Add social media links when available
      // 'https://www.facebook.com/autoserviceconnect',
      // 'https://www.instagram.com/autoserviceconnect',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

