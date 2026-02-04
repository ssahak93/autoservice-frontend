import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useAuthStore } from '@/stores/authStore';
import type { LoginRequest, RegisterRequest, User } from '@/types';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatarFileId?: string;
  preferredLanguage?: 'hy' | 'en' | 'ru';
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  success?: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
  accessToken?: string;
  refreshToken?: string;
  user?: User;
}

export const authService = {
  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },

  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  /**
   * Logout user - invalidate tokens on server
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      // Call logout endpoint to invalidate tokens on server
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {
        refreshToken: refreshToken || undefined,
      });
    } catch (error) {
      // Even if API call fails, clear local tokens
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local tokens and state
      useAuthStore.getState().logout();
    }
  },

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      data
    );
    return response.data;
  },

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      data
    );
    return response.data;
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.get<{ success: boolean; message: string }>(
      API_ENDPOINTS.AUTH.VERIFY_EMAIL,
      { params: { token } }
    );
    return response.data;
  },

  /**
   * Resend verification email
   */
  async resendVerificationEmail(
    email: string,
    locale: string = 'hy'
  ): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
      { email, locale }
    );
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.put<User>(API_ENDPOINTS.AUTH.UPDATE_PROFILE, data);
    return response.data;
  },

  /**
   * Change password
   */
  async changePassword(
    data: ChangePasswordRequest
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put<{ success: boolean; message: string }>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      data
    );
    return response.data;
  },
};
