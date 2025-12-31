'use client';

import { ChevronRight, Home } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumbs Component
 *
 * Single Responsibility: Displays navigation breadcrumbs
 * Accessibility: Proper ARIA labels and keyboard navigation
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const t = useTranslations('navigation');

  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-2 text-sm text-neutral-600', className)}
    >
      <ol className="flex items-center gap-2">
        {/* Home */}
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 rounded transition-colors hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label={t('home')}
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">{t('home')}</span>
          </Link>
        </li>

        {/* Breadcrumb Items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-neutral-400" aria-hidden="true" />
              {isLast ? (
                <span className="font-medium text-neutral-900" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href || '#'}
                  className="rounded transition-colors hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
