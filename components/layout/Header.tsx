'use client';

import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { HeaderActions } from '@/components/layout/HeaderActions';
import { HeaderNavigation } from '@/components/layout/HeaderNavigation';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useAuth } from '@/hooks/useAuth';
import { Link } from '@/i18n/routing';
import { formatUserName } from '@/lib/utils/user';

/**
 * Header Component
 *
 * Single Responsibility: Only orchestrates header layout and state
 * Composition: Uses smaller components for specific responsibilities
 */
export function Header() {
  const t = useTranslations('navigation');
  const tFooter = useTranslations('footer');
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only showing auth-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const userName = user ? formatUserName(user.firstName, user.lastName) : undefined;

  // Use mounted state to ensure server and client render match initially
  // On server, mounted is always false, so we render non-auth version
  // On client, after mount, we can show auth-dependent content
  // This prevents hydration mismatch because server always renders false
  const showAuthContent = mounted ? isAuthenticated : false;

  return (
    <header className="glass-light sticky top-0 z-40 border-b border-white/20">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="font-display text-xl font-bold text-primary-600">
          {tFooter('appName')}
        </Link>

        {/* Desktop Navigation */}
        <HeaderNavigation isAuthenticated={showAuthContent} />

        {/* Desktop Actions */}
        <HeaderActions isAuthenticated={showAuthContent} userName={userName} onLogout={logout} />

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          {showAuthContent && <NotificationBell />}
          <LanguageSwitcher />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-neutral-700 transition-colors hover:bg-neutral-100"
            aria-label={mobileMenuOpen ? t('close') : t('menu')}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        isAuthenticated={showAuthContent}
        userName={userName}
        onClose={() => setMobileMenuOpen(false)}
        onLogout={logout}
      />
    </header>
  );
}
