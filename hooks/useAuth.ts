'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

import { useRouter } from '@/i18n/routing';
import { authService } from '@/lib/services/auth.service';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import type { LoginRequest, RegisterRequest, User } from '@/types';

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, setUser, setTokens } = useAuthStore();
  const { showToast } = useUIStore();
  const t = useTranslations('auth');

  // Check if token exists in localStorage (for page reloads)
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('accessToken');

  // Get current user - enable query if authenticated OR if token exists (for page reloads)
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        return await authService.getCurrentUser();
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
    enabled: isAuthenticated || hasToken, // Enable if authenticated OR token exists
    retry: false,
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
            router.push(redirectUrl);
          } else {
            // Default redirect to services
            router.push('/services');
          }
        }, 100);
      } else {
        showToast(t('loginFailed', { defaultValue: 'Login failed. Please try again.' }), 'error');
      }
    },
    onError: (error: Error) => {
      const errorMessage =
        error.message ||
        t('loginFailedMessage', { defaultValue: 'Login failed. Please check your credentials.' });
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
            router.push(redirectUrl);
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
    onError: (error: Error) => {
      const errorMessage =
        error.message ||
        t('registrationFailedMessage', {
          defaultValue: 'Registration failed. Please check your information.',
        });
      showToast(errorMessage, 'error');
    },
  });

  // Logout
  const handleLogout = () => {
    authService.logout();
    queryClient.clear();
    showToast(t('logoutSuccess', { defaultValue: 'Logged out successfully' }), 'success');
    router.push('/login');
  };

  // For SSR compatibility, we need to ensure isAuthenticated is consistent
  // On server, it should always be false
  // On client, after mount, we can use the actual value
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return {
    user: (currentUser || user) as User | null,
    // On server, always return false to prevent hydration mismatch
    // On client, after mount, return actual value
    isAuthenticated: mounted ? isAuthenticated : false,
    isLoading: isLoadingUser || loginMutation.isPending || registerMutation.isPending,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: handleLogout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
};
