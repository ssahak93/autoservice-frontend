import type { Locale } from '@/i18n/routing';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { unwrapResponseData } from '@/lib/utils/api-response';
import { getCurrentLocale } from '@/lib/utils/i18n';
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
  preferredLanguage?: Locale;
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
    const response = await apiClient.get<User | { success: boolean; data: User }>(
      API_ENDPOINTS.AUTH.ME
    );
    return unwrapResponseData(response);
  },

  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse | { success: boolean; data: AuthResponse }>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    );
    return unwrapResponseData(response);
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse | { success: boolean; data: AuthResponse }>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    return unwrapResponseData(response);
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
    const response = await apiClient.post<
      { message: string } | { success: boolean; data: { message: string } }
    >(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
    return unwrapResponseData(response);
  },

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      data
    );
    return unwrapResponseData(response);
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.get<{ success: boolean; message: string }>(
      API_ENDPOINTS.AUTH.VERIFY_EMAIL,
      { params: { token } }
    );
    return unwrapResponseData(response);
  },

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string, locale?: string): Promise<{ message: string }> {
    const currentLocale = locale || getCurrentLocale();
    const response = await apiClient.post<
      { message: string } | { success: boolean; data: { message: string } }
    >(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, { email, locale: currentLocale });
    return unwrapResponseData(response);
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.put<User | { success: boolean; data: User }>(
      API_ENDPOINTS.AUTH.UPDATE_PROFILE,
      data
    );
    return unwrapResponseData(response);
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
    return unwrapResponseData(response);
  },
};
