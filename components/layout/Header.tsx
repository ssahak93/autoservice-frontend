'use client';

import { useTranslations } from 'next-intl';

import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { Link } from '@/i18n/routing';

export function Header() {
  const t = useTranslations('navigation');
  const tFooter = useTranslations('footer');
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="glass-light sticky top-0 z-40 border-b border-white/20">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="font-display text-xl font-bold text-primary-600">
          {tFooter('appName')}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/services"
            className="text-neutral-700 transition-colors hover:text-primary-600"
          >
            {t('services')}
          </Link>
          {isAuthenticated && (
            <>
              <Link
                href="/visits"
                className="text-neutral-700 transition-colors hover:text-primary-600"
              >
                {t('myVisits')}
              </Link>
              <Link
                href="/profile"
                className="text-neutral-700 transition-colors hover:text-primary-600"
              >
                {t('profile')}
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated && <NotificationBell />}
          <LanguageSwitcher />
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="hidden text-sm text-neutral-600 md:inline">
                {user?.firstName} {user?.lastName}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                {t('logout')}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  {t('login')}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">{t('signUp')}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
