import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { ServicesClient } from '@/components/services/ServicesClient';
import { servicesServerService } from '@/lib/services/services.server';
import type { AutoService, PaginatedResponse } from '@/types';

import { generateServicesMetadata } from './metadata';

interface ServicesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    city?: string;
    region?: string;
    district?: string;
    serviceType?: string;
    minRating?: string;
    latitude?: string;
    longitude?: string;
    radius?: string;
    page?: string;
    limit?: string;
    sortBy?: 'rating' | 'distance' | 'reviews' | 'newest';
    query?: string;
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
    district: search.district,
    serviceType: search.serviceType,
    minRating: search.minRating ? parseFloat(search.minRating) : undefined,
    latitude: search.latitude ? parseFloat(search.latitude) : undefined,
    longitude: search.longitude ? parseFloat(search.longitude) : undefined,
    radius: search.radius ? parseFloat(search.radius) : undefined,
    page: search.page ? parseInt(search.page, 10) : 1,
    limit: search.limit ? parseInt(search.limit, 10) : 20,
    sortBy: search.sortBy || 'rating',
    query: search.query,
  };

  // Fetch initial data server-side for SEO
  let initialData: PaginatedResponse<AutoService> | undefined;
  let error: { message: string; code?: string } | null = null;

  try {
    const data = await servicesServerService.search(filters, locale);
    // Ensure data is serializable - convert to plain object
    // This handles any potential non-serializable values
    initialData = data
      ? (JSON.parse(JSON.stringify(data)) as PaginatedResponse<AutoService>)
      : undefined;
  } catch (err) {
    // Convert Error to plain object for serialization
    // Error objects cannot be passed from Server to Client Components
    error = {
      message: err instanceof Error ? err.message : 'Failed to load services',
      code: err instanceof Error && 'code' in err ? String(err.code) : undefined,
    };
    // Continue to render with error state
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl font-bold text-neutral-900 sm:text-3xl md:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-sm text-neutral-600 sm:text-base">{t('subtitle')}</p>
      </div>

      <ServicesClient initialData={initialData} initialError={error} />
    </div>
  );
}
