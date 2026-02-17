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

  // Check if user owns a provider
  const isServiceOwner = user?.providers && user.providers.length > 0;

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
            {/* My Account */}
            <div className="border-t border-neutral-200 pt-2">
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {t('myAccount', { defaultValue: 'My Account' })}
              </div>
              {userName && (
                <div className="px-4 py-2 text-sm font-medium text-neutral-900">{userName}</div>
              )}
              <Link
                href="/visits"
                className="block rounded-lg px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary-600"
                onClick={handleLinkClick}
              >
                {t('myVisits')}
              </Link>
              <Link
                href="/profile/vehicles"
                className="block rounded-lg px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary-600"
                onClick={handleLinkClick}
              >
                {t('myVehicles', { defaultValue: 'My Vehicles' })}
              </Link>
              <Link
                href="/notifications"
                className="block rounded-lg px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary-600"
                onClick={handleLinkClick}
              >
                {t('notifications', { defaultValue: 'Notifications' })}
              </Link>
              <Link
                href="/profile"
                className="block rounded-lg px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary-600"
                onClick={handleLinkClick}
              >
                {t('profile')}
              </Link>
              <button
                onClick={handleLogout}
                className="w-full rounded-lg px-4 py-2 text-left text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary-600"
              >
                {t('logout')}
              </button>
            </div>
            {/* Support & Info */}
            <div className="border-t border-neutral-200 pt-2">
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {t('support', { defaultValue: 'Support' })}
              </div>
              <Link
                href="/support"
                className="block rounded-lg px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary-600"
                onClick={handleLinkClick}
              >
                {t('support', { defaultValue: 'Support' })}
              </Link>
              <Link
                href="/help"
                className="block rounded-lg px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary-600"
                onClick={handleLinkClick}
              >
                {t('help', { defaultValue: 'Help & FAQ' })}
              </Link>
              <Link
                href="/about"
                className="block rounded-lg px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary-600"
                onClick={handleLinkClick}
              >
                {t('about')}
              </Link>
              <Link
                href="/contact"
                className="block rounded-lg px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary-600"
                onClick={handleLinkClick}
              >
                {t('contact')}
              </Link>
            </div>
          </>
        )}
        {!isAuthenticated && (
          <>
            {/* Support & Info for non-authenticated */}
            <div className="mt-2 border-t border-neutral-200 pt-2">
              <Link
                href="/help"
                className="block rounded-lg px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary-600"
                onClick={handleLinkClick}
              >
                {t('help', { defaultValue: 'Help & FAQ' })}
              </Link>
              <Link
                href="/about"
                className="block rounded-lg px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary-600"
                onClick={handleLinkClick}
              >
                {t('about')}
              </Link>
              <Link
                href="/contact"
                className="block rounded-lg px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary-600"
                onClick={handleLinkClick}
              >
                {t('contact')}
              </Link>
            </div>
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
