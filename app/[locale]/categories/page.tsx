import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { CategoriesClient } from '@/components/categories/CategoriesClient';
import { categoriesServerService } from '@/lib/services/categories.server';
import type { Category } from '@/lib/services/categories.service';

interface CategoriesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: CategoriesPageProps): Promise<Metadata> {
  await params; // Await params but don't use locale in metadata
  const t = await getTranslations('serviceCategories');

  return {
    title: t('title', { defaultValue: 'Service Categories' }),
    description: t('subtitle', {
      defaultValue: 'Browse automotive service categories',
    }),
  };
}

export default async function CategoriesPage({ params }: CategoriesPageProps) {
  const { locale } = await params;

  // Validate locale
  const validLocales = ['hy', 'en', 'ru'];
  if (!validLocales.includes(locale)) {
    notFound();
  }

  void locale; // Locale validated above, not used after validation

  const t = await getTranslations('serviceCategories');

  // Fetch categories server-side for SEO
  let categories: Category[] = [];
  try {
    categories = await categoriesServerService.getAll();
  } catch (error) {
    // Continue with empty array if fetch fails
    console.error('Failed to fetch categories:', error);
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl font-bold text-neutral-900 sm:text-3xl md:text-4xl">
          {t('title', { defaultValue: 'Service Categories' })}
        </h1>
        <p className="mt-2 text-sm text-neutral-600 sm:text-base">
          {t('subtitle', {
            defaultValue: 'Browse services by category to find what you need',
          })}
        </p>
      </div>

      <CategoriesClient initialCategories={categories} />
    </div>
  );
}
