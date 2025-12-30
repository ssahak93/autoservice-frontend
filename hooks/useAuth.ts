'use client';

import { useRouter } from '@/i18n/routing';
import { authService } from '@/lib/services/auth.service';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import type { LoginRequest, RegisterRequest, User } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, setUser, setTokens, logout } = useAuthStore();
  const { showToast } = useUIStore();

  // Get current user
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authService.getCurrentUser(),
    enabled: isAuthenticated,
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        setUser(response.data.user);
        setTokens(response.data.accessToken, response.data.refreshToken);
        queryClient.setQueryData(['auth', 'me'], response.data.user);
        showToast('Login successful', 'success');
        router.push('/dashboard');
      }
    },
    onError: (error: Error) => {
      showToast(error.message || 'Login failed', 'error');
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        setUser(response.data.user);
        setTokens(response.data.accessToken, response.data.refreshToken);
        queryClient.setQueryData(['auth', 'me'], response.data.user);
        showToast('Registration successful', 'success');
        router.push('/dashboard');
      }
    },
    onError: (error: Error) => {
      showToast(error.message || 'Registration failed', 'error');
    },
  });

  // Logout
  const handleLogout = () => {
    authService.logout();
    queryClient.clear();
    showToast('Logged out successfully', 'success');
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
