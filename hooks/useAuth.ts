'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

import { useRouter } from '@/i18n/routing';
import { authService } from '@/lib/services/auth.service';
import { extractErrorMessage } from '@/lib/utils/errorHandler';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import type { LoginRequest, RegisterRequest, User } from '@/types';

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, accessToken, setUser, setTokens } = useAuthStore();
  const { showToast } = useUIStore();
  const t = useTranslations('auth');

  // Check if token exists in localStorage (for validating token on page reload)
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('accessToken');

  // Get current user - only fetch if we have a token (to validate it)
  // But don't fetch if user is already loaded (to avoid unnecessary requests)
  // Also refetch if user exists but emailVerified might have changed
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const userData = await authService.getCurrentUser();
        // If successful, set user and mark as authenticated
        setUser(userData);
        return userData;
      } catch (error) {
        // If user fetch fails (e.g., 401 Unauthorized), clear auth state
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          // Token is invalid, clear auth state
          setUser(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        }
        // Return null instead of undefined to prevent React Query errors
        // Error is handled by React Query, no need to log here
        return null;
      }
    },
    // Only fetch if:
    // 1. We have a token (to validate it), AND
    // 2. User is not already loaded (to avoid unnecessary requests)
    // OR if user exists but emailVerified is false (to check if it was verified)
    enabled: hasToken && (!user || (user && !user.emailVerified)),
    retry: false,
    // Refetch every 30 seconds if email is not verified (to check if user verified it)
    refetchInterval: user && !user.emailVerified ? 30000 : false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      // Backend returns data directly or wrapped in {success, data}
      // Handle both cases for compatibility
      const authData =
        response.success && response.data
          ? response.data
          : (response as unknown as { accessToken: string; refreshToken: string; user: User });

      if (authData && authData.accessToken && authData.refreshToken && authData.user) {
        // Set tokens first to ensure API client can use them
        setTokens(authData.accessToken, authData.refreshToken);
        // Then set user
        setUser(authData.user);
        // Update React Query cache with the user data
        queryClient.setQueryData(['auth', 'me'], authData.user);
        showToast(t('loginSuccess', { defaultValue: 'Login successful' }), 'success');
        // Small delay to ensure state is updated before redirect
        setTimeout(() => {
          // Check if there's a saved redirect URL
          const redirectUrl =
            typeof window !== 'undefined' ? sessionStorage.getItem('redirectAfterLogin') : null;

          if (redirectUrl) {
            // Remove the saved URL and redirect there
            sessionStorage.removeItem('redirectAfterLogin');
            // Strip locale prefix if present (for backward compatibility)
            const normalizedUrl = redirectUrl.replace(/^\/(hy|en|ru)(\/|$)/, '/');
            router.push(normalizedUrl);
          } else {
            // Default redirect to services
            router.push('/services');
          }
        }, 100);
      } else {
        showToast(t('loginFailed', { defaultValue: 'Login failed. Please try again.' }), 'error');
      }
    },
    onError: (error: unknown) => {
      // Extract specific error message from API response
      const extractedMessage = extractErrorMessage(error);

      // Use extracted message if it's meaningful, otherwise use fallback
      const errorMessage =
        extractedMessage &&
        !extractedMessage.includes('status code') &&
        !extractedMessage.includes('Request failed')
          ? extractedMessage
          : t('loginFailedMessage', {
              defaultValue: 'Login failed. Please check your credentials.',
            });

      showToast(errorMessage, 'error');
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (response) => {
      // Backend returns data directly or wrapped in {success, data}
      // Handle both cases for compatibility
      const authData =
        response.success && response.data
          ? response.data
          : (response as unknown as { accessToken: string; refreshToken: string; user: User });

      if (authData && authData.accessToken && authData.refreshToken && authData.user) {
        // Set tokens first to ensure API client can use them
        setTokens(authData.accessToken, authData.refreshToken);
        // Then set user
        setUser(authData.user);
        // Update React Query cache with the user data
        queryClient.setQueryData(['auth', 'me'], authData.user);
        showToast(t('registrationSuccess', { defaultValue: 'Registration successful' }), 'success');
        // Small delay to ensure state is updated before redirect
        setTimeout(() => {
          // Check if there's a saved redirect URL
          const redirectUrl =
            typeof window !== 'undefined' ? sessionStorage.getItem('redirectAfterLogin') : null;

          if (redirectUrl) {
            // Remove the saved URL and redirect there
            sessionStorage.removeItem('redirectAfterLogin');
            // Strip locale prefix if present (for backward compatibility)
            const normalizedUrl = redirectUrl.replace(/^\/(hy|en|ru)(\/|$)/, '/');
            router.push(normalizedUrl);
          } else {
            // Default redirect to services
            router.push('/services');
          }
        }, 100);
      } else {
        showToast(
          t('registrationFailed', { defaultValue: 'Registration failed. Please try again.' }),
          'error'
        );
      }
    },
    onError: (error: unknown) => {
      // Extract specific error message from API response
      const extractedMessage = extractErrorMessage(error);

      // Use extracted message if it's meaningful, otherwise use fallback
      const errorMessage =
        extractedMessage &&
        !extractedMessage.includes('status code') &&
        !extractedMessage.includes('Request failed')
          ? extractedMessage
          : t('registrationFailedMessage', {
              defaultValue: 'Registration failed. Please check your information.',
            });

      showToast(errorMessage, 'error');
    },
  });

  // Logout
  const handleLogout = async () => {
    try {
      await authService.logout();
      queryClient.clear();
      showToast(t('logoutSuccess', { defaultValue: 'Logged out successfully' }), 'success');
      router.push('/auth/login');
    } catch {
      // Even if logout fails, clear local state
      queryClient.clear();
      showToast(t('logoutSuccess', { defaultValue: 'Logged out successfully' }), 'success');
      router.push('/auth/login');
    }
  };

  // For SSR compatibility, we need to ensure isAuthenticated is consistent
  // On server, it should always be false
  // On client, after mount, we can use the actual value
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if we have a valid token (either in store or localStorage)
  const hasValidToken =
    mounted &&
    typeof window !== 'undefined' &&
    (!!accessToken || !!localStorage.getItem('accessToken'));

  return {
    user: (currentUser || user) as User | null,
    // On server, always return false to prevent hydration mismatch
    // On client, after mount, return actual value only if we have both authentication state AND token
    isAuthenticated: mounted ? isAuthenticated && hasValidToken : false,
    isLoading: isLoadingUser || loginMutation.isPending || registerMutation.isPending,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: handleLogout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
};
