'use client';

import { useTranslations } from 'next-intl';

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

  // Check if user owns an auto service
  const isServiceOwner = user?.autoServices && user.autoServices.length > 0;

  return (
    <nav className="hidden items-center gap-6 md:flex">
      <Link
        href="/services"
        className="text-neutral-700 transition-colors hover:text-primary-600"
        onClick={onLinkClick}
      >
        {t('services')}
      </Link>
      {isAuthenticated && (
        <>
          {isServiceOwner && (
            <Link
              href="/dashboard"
              className="text-neutral-700 transition-colors hover:text-primary-600"
              onClick={onLinkClick}
            >
              {t('dashboard')}
            </Link>
          )}
          <Link
            href="/visits"
            className="text-neutral-700 transition-colors hover:text-primary-600"
            onClick={onLinkClick}
          >
            {t('myVisits')}
          </Link>
          <Link
            href="/profile"
            className="text-neutral-700 transition-colors hover:text-primary-600"
            onClick={onLinkClick}
          >
            {t('profile')}
          </Link>
        </>
      )}
    </nav>
  );
}
