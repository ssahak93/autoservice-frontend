'use client';

import { useTranslations } from 'next-intl';

import { SupportInfoMenu } from '@/components/layout/SupportInfoMenu';
import { useAuth } from '@/hooks/useAuth';
import { Link } from '@/i18n/routing';

interface HeaderNavigationProps {
  isAuthenticated: boolean;
  onLinkClick?: () => void;
}

/**
 * HeaderNavigation Component
 *
 * Single Responsibility: Only handles navigation links rendering
 * Interface Segregation: Only receives props it needs
 */
export function HeaderNavigation({ isAuthenticated, onLinkClick }: HeaderNavigationProps) {
  const t = useTranslations('navigation');
  const { user } = useAuth();

  // Check if user owns a provider
  const isServiceOwner = user?.providers && user.providers.length > 0;

  return (
    <nav className="hidden items-center gap-6 md:flex">
      <Link
        href="/categories"
        className="text-neutral-700 transition-colors hover:text-primary-600"
        onClick={onLinkClick}
      >
        {t('categories', { defaultValue: 'Categories' })}
      </Link>
      <Link
        href="/services"
        className="text-neutral-700 transition-colors hover:text-primary-600"
        onClick={onLinkClick}
      >
        {t('services')}
      </Link>
      {isAuthenticated && isServiceOwner && (
        <Link
          href="/dashboard"
          className="text-neutral-700 transition-colors hover:text-primary-600"
          onClick={onLinkClick}
        >
          {t('dashboard')}
        </Link>
      )}
      <SupportInfoMenu />
    </nav>
  );
}
