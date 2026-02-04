'use client';

import { useTranslations } from 'next-intl';

import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/routing';

interface HeaderActionsProps {
  isAuthenticated: boolean;
  userName?: string;
  onLogout: () => void;
}

/**
 * HeaderActions Component
 *
 * Single Responsibility: Only handles header action buttons
 * Interface Segregation: Only receives props it needs
 */
export function HeaderActions({ isAuthenticated, userName, onLogout }: HeaderActionsProps) {
  const t = useTranslations('navigation');

  return (
    <div className="hidden items-center gap-4 md:flex">
      {isAuthenticated && <NotificationBell />}
      <LanguageSwitcher />
      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          {userName && <span className="text-sm text-neutral-600">{userName}</span>}
          <Button variant="outline" size="sm" onClick={onLogout}>
            {t('logout')}
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              {t('login')}
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button size="sm">{t('signUp')}</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
