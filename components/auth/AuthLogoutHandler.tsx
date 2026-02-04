'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/stores/authStore';

/**
 * AuthLogoutHandler Component
 *
 * Handles auth:logout events from API client and redirects to login page.
 * Also clears React Query cache when auth:clear-cache event is dispatched.
 * Must be used inside NextIntlClientProvider to have access to router.
 */
export function AuthLogoutHandler() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleAuthLogout = () => {
      // Clear React Query cache
      queryClient.clear();
      // Clear auth store (in case it wasn't cleared by apiClient)
      useAuthStore.getState().logout();
      // Redirect to login
      router.push('/auth/login');
    };

    const handleClearCache = () => {
      // Clear React Query cache when requested by apiClient
      queryClient.clear();
    };

    window.addEventListener('auth:logout', handleAuthLogout as EventListener);
    window.addEventListener('auth:clear-cache', handleClearCache as EventListener);

    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout as EventListener);
      window.removeEventListener('auth:clear-cache', handleClearCache as EventListener);
    };
  }, [router, queryClient]);

  return null; // This component doesn't render anything
}
