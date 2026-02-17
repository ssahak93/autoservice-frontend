import { MetadataRoute } from 'next';

interface SitemapProfile {
  id: string;
  updatedAt: string;
}

async function getAllServices(): Promise<SitemapProfile[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/api/providers/sitemap/list`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      console.error('Failed to fetch services for sitemap:', response.statusText);
      return [];
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching services for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME || 'autoserviceconnect.am'}`;
  const locales = ['en', 'ru', 'hy'];

  // Get all providers (replace with actual API call)
  const providers = await getAllServices();

  // Generate provider URLs for all locales
  const providerUrls = providers.flatMap((provider: { id: string; updatedAt?: string }) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/services/${provider.id}`,
      lastModified: provider.updatedAt ? new Date(provider.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  );

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ];

  // Generate localized static pages
  const localizedStaticPages = locales.flatMap((locale) => [
    {
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: locale === 'en' ? 1 : 0.9,
    },
    {
      url: `${baseUrl}/${locale}/services`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ]);

  return [...staticPages, ...localizedStaticPages, ...providerUrls];
}
