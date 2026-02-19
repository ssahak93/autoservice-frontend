import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { CategoryDetailClient } from '@/components/categories/CategoryDetailClient';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { categoriesServerService } from '@/lib/services/categories.server';

interface CategoryDetailPageProps {
  params: Promise<{ locale: string; code: string }>;
}

export async function generateMetadata({ params }: CategoryDetailPageProps): Promise<Metadata> {
  const { locale, code } = await params;
  const category = await categoriesServerService.getByCode(code);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  const getName = () => {
    if (locale === 'hy') return category.nameHy;
    if (locale === 'ru') return category.nameRu;
    return category.name;
  };

  return {
    title: `${getName()} - Auto Service Connect`,
    description: `Find ${getName()} services in Armenia`,
  };
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { locale, code } = await params;

  // Validate locale
  const validLocales = ['hy', 'en', 'ru'];
  if (!validLocales.includes(locale)) {
    notFound();
  }

  const t = await getTranslations('serviceCategories');

  // Fetch category server-side for SEO
  const category = await categoriesServerService.getByCode(code);

  if (!category || !category.isActive) {
    notFound();
  }

  const getName = () => {
    if (locale === 'hy') return category.nameHy;
    if (locale === 'ru') return category.nameRu;
    return category.name;
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: t('home', { defaultValue: 'Home' }), href: '/' },
          {
            label: t('categories', { defaultValue: 'Categories' }),
            href: '/categories',
          },
          { label: getName() },
        ]}
      />

      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl font-bold text-neutral-900 sm:text-3xl md:text-4xl">
          {getName()}
        </h1>
        <p className="mt-2 text-sm text-neutral-600 sm:text-base">
          {t('categoryDescription', {
            defaultValue: 'Browse services in this category',
          })}
        </p>
      </div>

      <CategoryDetailClient category={category} locale={locale} />
    </div>
  );
}
