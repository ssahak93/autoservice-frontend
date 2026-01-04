'use client';

import { useTranslations } from 'next-intl';

import { Breadcrumbs, type BreadcrumbItem } from './Breadcrumbs';

interface ServiceBreadcrumbsProps {
  serviceName: string;
  className?: string;
}

/**
 * ServiceBreadcrumbs Component
 *
 * Single Responsibility: Generates breadcrumbs for service detail pages
 * Reusable: Can be used on any service detail page
 */
export function ServiceBreadcrumbs({ serviceName, className }: ServiceBreadcrumbsProps) {
  const t = useTranslations('navigation');
  const tServices = useTranslations('services');

  const items: BreadcrumbItem[] = [
    { label: t('home'), href: '/' },
    { label: tServices('title', { defaultValue: 'Services' }), href: '/services' },
    { label: serviceName },
  ];

  return <Breadcrumbs items={items} className={className} />;
}
