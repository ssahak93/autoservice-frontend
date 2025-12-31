'use client';

import { useEffect } from 'react';

import { useRouter } from '@/i18n/routing';

/**
 * AuthLogoutHandler Component
 *
 * Handles auth:logout events from API client and redirects to login page.
 * Must be used inside NextIntlClientProvider to have access to router.
 */
export function AuthLogoutHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthLogout = () => {
      // router.push already handles locale, so just use '/login'
      router.push('/login');
    };

    window.addEventListener('auth:logout', handleAuthLogout as EventListener);
    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout as EventListener);
    };
  }, [router]);

  return null; // This component doesn't render anything
}
