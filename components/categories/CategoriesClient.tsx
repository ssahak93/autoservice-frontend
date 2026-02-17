'use client';

import { useTranslations } from 'next-intl';

import { useCategories } from '@/hooks/useCategories';
import type { Category } from '@/lib/services/categories.service';

import { CategoriesSkeleton } from './CategoriesSkeleton';
import { CategoryCard } from './CategoryCard';

interface CategoriesClientProps {
  initialCategories?: Category[];
}

export function CategoriesClient({ initialCategories = [] }: CategoriesClientProps) {
  const t = useTranslations('serviceCategories');
  const { data: categories = initialCategories, isLoading } = useCategories();

  if (isLoading && initialCategories.length === 0) {
    return <CategoriesSkeleton />;
  }

  if (categories.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <p className="text-neutral-600">
          {t('noCategories', { defaultValue: 'No categories available' })}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
