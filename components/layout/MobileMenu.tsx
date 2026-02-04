'use client';

import { useTranslations } from 'next-intl';

import { useAuth } from '@/hooks/useAuth';
import { Link } from '@/i18n/routing';

interface MobileMenuProps {
  isOpen: boolean;
  isAuthenticated: boolean;
  userName?: string;
  onClose: () => void;
  onLogout: () => void;
}

/**
 * MobileMenu Component
 *
 * Single Responsibility: Only handles mobile menu rendering
 * Interface Segregation: Only receives props it needs
 */
export function MobileMenu({
  isOpen,
  isAuthenticated,
  userName,
  onClose,
  onLogout,
}: MobileMenuProps) {
  const t = useTranslations('navigation');
  const { user } = useAuth();

  // Check if user owns an auto service
  const isServiceOwner = user?.autoServices && user.autoServices.length > 0;

  if (!isOpen) return null;

  const handleLinkClick = () => {
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <div className="border-t border-white/20 bg-white md:hidden">
      <nav className="container mx-auto space-y-2 px-4 py-4">
        <Link
          href="/services"
          className="block rounded-lg px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary-600"
          onClick={handleLinkClick}
        >
          {t('services')}
        </Link>
        {isAuthenticated && (
          <>
            {isServiceOwner && (
              <Link
                href="/dashboard"
                className="block rounded-lg px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary-600"
                onClick={handleLinkClick}
              >
                {t('dashboard')}
              </Link>
            )}
            <Link
              href="/visits"
              className="block rounded-lg px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary-600"
              onClick={handleLinkClick}
            >
              {t('myVisits')}
            </Link>
            <Link
              href="/profile"
              className="block rounded-lg px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary-600"
              onClick={handleLinkClick}
            >
              {t('profile')}
            </Link>
            <Link
              href="/support"
              className="block rounded-lg px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary-600"
              onClick={handleLinkClick}
            >
              {t('support', { defaultValue: 'Support' })}
            </Link>
            <div className="mt-2 border-t border-neutral-200 pt-2">
              {userName && <div className="px-4 py-2 text-sm text-neutral-600">{userName}</div>}
              <button
                onClick={handleLogout}
                className="w-full rounded-lg px-4 py-2 text-left text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary-600"
              >
                {t('logout')}
              </button>
            </div>
          </>
        )}
        {!isAuthenticated && (
          <div className="mt-2 space-y-2 border-t border-neutral-200 pt-2">
            <Link
              href="/auth/login"
              className="block rounded-lg px-4 py-2 text-center text-neutral-700 transition-colors hover:bg-neutral-100"
              onClick={handleLinkClick}
            >
              {t('login')}
            </Link>
            <Link
              href="/auth/register"
              className="block rounded-lg bg-primary-600 px-4 py-2 text-center text-white transition-colors hover:bg-primary-700"
              onClick={handleLinkClick}
            >
              {t('signUp')}
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
}
