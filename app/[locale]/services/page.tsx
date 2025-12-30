import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { ServicesClient } from '@/components/services/ServicesClient';
import { servicesServerService } from '@/lib/services/services.server';

import { generateServicesMetadata } from './metadata';

interface ServicesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    city?: string;
    region?: string;
    serviceType?: string;
    minRating?: string;
    latitude?: string;
    longitude?: string;
    radius?: string;
    page?: string;
    limit?: string;
    sortBy?: 'rating' | 'distance' | 'reviews' | 'newest';
  }>;
}

export async function generateMetadata({ params }: ServicesPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateServicesMetadata(locale);
}

export default async function ServicesPage({ params, searchParams }: ServicesPageProps) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations('services');

  // Validate locale
  const validLocales = ['hy', 'en', 'ru'];
  if (!validLocales.includes(locale)) {
    notFound();
  }

  // Parse search params
  const filters = {
    city: search.city,
    region: search.region,
    serviceType: search.serviceType,
    minRating: search.minRating ? parseFloat(search.minRating) : undefined,
    latitude: search.latitude ? parseFloat(search.latitude) : undefined,
    longitude: search.longitude ? parseFloat(search.longitude) : undefined,
    radius: search.radius ? parseFloat(search.radius) : undefined,
    page: search.page ? parseInt(search.page, 10) : 1,
    limit: search.limit ? parseInt(search.limit, 10) : 20,
    sortBy: search.sortBy || 'rating',
  };

  // Fetch initial data server-side for SEO
  let initialData;
  let error: Error | null = null;

  try {
    initialData = await servicesServerService.search(filters, locale);
  } catch (err) {
    error = err instanceof Error ? err : new Error('Failed to load services');
    // Continue to render with error state
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-neutral-900">{t('title')}</h1>
        <p className="mt-2 text-neutral-600">{t('subtitle')}</p>
      </div>

      <ServicesClient initialData={initialData} initialError={error} />
    </div>
  );
}
