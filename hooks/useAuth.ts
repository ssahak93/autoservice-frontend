'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

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

  // Get current user
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        return await authService.getCurrentUser();
      } catch (error) {
        // If user fetch fails, return null instead of undefined
        // This prevents React Query from complaining about undefined
        console.error('Failed to fetch current user:', error);
        return null;
      }
    },
    enabled: isAuthenticated,
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
          router.push('/services');
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
          router.push('/services');
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

  return {
    user: (currentUser || user) as User | null,
    isAuthenticated,
    isLoading: isLoadingUser || loginMutation.isPending || registerMutation.isPending,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: handleLogout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
};
