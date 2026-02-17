'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/i18n/routing';
import type { Category } from '@/lib/services/categories.service';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const t = useTranslations('serviceCategories');
  const locale = useLocale();

  // Get localized name
  const getName = () => {
    if (locale === 'hy') return category.nameHy;
    if (locale === 'ru') return category.nameRu;
    return category.name;
  };

  const serviceTypesCount = category.serviceTypes?.length || 0;

  return (
    <Link href={`/categories/${category.code}`}>
      <motion.div
        className="glass-light group relative overflow-hidden rounded-xl p-6 transition-all hover:scale-105 hover:shadow-lg"
        whileHover={{ y: -4 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-display text-xl font-semibold text-neutral-900 group-hover:text-primary-600">
              {getName()}
            </h3>
            {serviceTypesCount > 0 && (
              <p className="mt-2 text-sm text-neutral-600">
                {t('serviceTypesCount', {
                  count: serviceTypesCount,
                  defaultValue: `${serviceTypesCount} service types`,
                })}
              </p>
            )}
          </div>
          <ArrowRight className="ml-4 h-5 w-5 text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-primary-600" />
        </div>
      </motion.div>
    </Link>
  );
}
