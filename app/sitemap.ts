import { MetadataRoute } from 'next';

interface SitemapProfile {
  id: string;
  updatedAt: string;
}

async function getAllServices(): Promise<SitemapProfile[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/api/auto-services/sitemap/list`, {
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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://autoserviceconnect.am';
  const locales = ['en', 'ru', 'hy'];

  // Get all services (replace with actual API call)
  const services = await getAllServices();

  // Generate service URLs for all locales
  const serviceUrls = services.flatMap((service: { id: string; updatedAt?: string }) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/services/${service.id}`,
      lastModified: service.updatedAt ? new Date(service.updatedAt) : new Date(),
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

  return [...staticPages, ...localizedStaticPages, ...serviceUrls];
}
