import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useAuthStore } from '@/stores/authStore';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types';

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      // Backend returns data directly: { accessToken, refreshToken, user }
      // We need to wrap it in the expected format or handle it directly
      const response = await apiClient.post<
        AuthResponse | { accessToken: string; refreshToken: string; user: User }
      >(API_ENDPOINTS.AUTH.REGISTER, data);

      // Check if response is already in AuthResponse format
      if ('success' in response.data && response.data.success) {
        return response.data as AuthResponse;
      }

      // Otherwise, wrap the direct response
      return {
        success: true,
        data: response.data as { accessToken: string; refreshToken: string; user: User },
      };
    } catch (error) {
      // Extract error message from backend response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { error?: { message?: string }; message?: string } };
        };
        const errorMessage =
          axiosError.response?.data?.error?.message ||
          axiosError.response?.data?.message ||
          'Registration failed';
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // Backend returns data directly: { accessToken, refreshToken, user }
      // We need to wrap it in the expected format or handle it directly
      const response = await apiClient.post<
        AuthResponse | { accessToken: string; refreshToken: string; user: User }
      >(API_ENDPOINTS.AUTH.LOGIN, data);

      // Check if response is already in AuthResponse format
      if ('success' in response.data && response.data.success) {
        return response.data as AuthResponse;
      }

      // Otherwise, wrap the direct response
      return {
        success: true,
        data: response.data as { accessToken: string; refreshToken: string; user: User },
      };
    } catch (error) {
      // Extract error message from backend response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { error?: { message?: string }; message?: string } };
        };
        const errorMessage =
          axiosError.response?.data?.error?.message ||
          axiosError.response?.data?.message ||
          'Invalid email or password';
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  async getCurrentUser(): Promise<User> {
    // Backend returns user data directly, not wrapped in {success, data}
    const response = await apiClient.get<User | { success: boolean; data: User }>(
      API_ENDPOINTS.AUTH.ME
    );

    // Check if response is wrapped
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data
    ) {
      return (response.data as { success: boolean; data: User }).data;
    }

    // Otherwise, return data directly
    return response.data as User;
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    });
    return response.data;
  },

  logout(): void {
    useAuthStore.getState().logout();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    avatarFileId?: string;
  }): Promise<User> {
    // Try PUT first, fallback to PATCH
    try {
      const response = await apiClient.put<User>(API_ENDPOINTS.AUTH.ME, data);
      return response.data;
    } catch (error) {
      // If PUT fails, try PATCH
      const response = await apiClient.patch<User>(API_ENDPOINTS.AUTH.ME, data);
      return response.data;
    }
  },

  /**
   * Change password
   */
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await apiClient.put('/auth/change-password', data);
  },
};
