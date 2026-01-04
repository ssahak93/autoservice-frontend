import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
} from 'axios';

import { getCurrentLocale } from '@/lib/utils/i18n';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth token and locale
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add locale to request headers for backend
        // Using only Accept-Language (standard header) to reduce preflight complexity
        // Backend will fallback to Accept-Language if X-Locale is not present
        const locale = getCurrentLocale();
        if (config.headers) {
          config.headers['Accept-Language'] = locale;
          // X-Locale removed to reduce CORS preflight requests
          // Backend LocaleInterceptor will use Accept-Language as fallback
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // Handle notifications/stats endpoint errors gracefully
        const url = error.config?.url || '';
        const isNotificationsStats = url.includes('/notifications/stats');

        if (error.response?.status === 401) {
          const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

          // Check if this is a login/register/me request - don't try to refresh token
          const isAuthRequest =
            url.includes('/auth/login') ||
            url.includes('/auth/register') ||
            url.includes('/auth/me');

          if (isAuthRequest) {
            // For login/register/me, just reject the error - no redirect
            return Promise.reject(error);
          }

          // Prevent infinite loop: if we already tried to refresh, don't try again
          if (originalRequest._retry) {
            // Already tried to refresh, logout and redirect
            this.logout();
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('auth:logout'));
            }
            return Promise.reject(error);
          }

          // For other requests, token expired - try to refresh
          try {
            originalRequest._retry = true;
            await this.refreshToken();

            // Update the authorization header with the new token
            const newToken = this.getToken();
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }

            // Retry original request
            return this.client.request(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout and dispatch event for redirect
            originalRequest._retry = false; // Reset flag
            this.logout();
            if (typeof window !== 'undefined') {
              // Dispatch custom event for locale-aware redirect
              // AuthLogoutHandler will handle the redirect
              window.dispatchEvent(new CustomEvent('auth:logout'));
            }
            return Promise.reject(refreshError);
          }
        } else if (error.response?.status === 404 && isNotificationsStats) {
          // Handle 404 for notifications/stats gracefully
          // The service will return default stats as fallback
          return Promise.reject(error);
        }

        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  private async refreshToken(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken,
    });

    // Backend returns { accessToken, refreshToken } directly or wrapped in { success, data }
    let accessToken: string | undefined;
    let newRefreshToken: string | undefined;

    if (response.data?.data?.accessToken) {
      // Wrapped format: { success: true, data: { accessToken, refreshToken } }
      accessToken = response.data.data.accessToken;
      newRefreshToken = response.data.data.refreshToken;
    } else if (response.data?.accessToken) {
      // Direct format: { accessToken, refreshToken }
      accessToken = response.data.accessToken;
      newRefreshToken = response.data.refreshToken;
    }

    if (!accessToken || !newRefreshToken) {
      throw new Error('Invalid refresh token response');
    }

    this.setTokens(accessToken, newRefreshToken);
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  private logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  private getCurrentLocale(): string {
    if (typeof window === 'undefined') {
      return 'hy'; // Default for SSR
    }

    // Get from URL first (most reliable)
    const pathname = window.location.pathname;
    const localeMatch = pathname.match(/^\/(hy|en|ru)/);
    if (localeMatch) {
      return localeMatch[1];
    }

    // Fallback to localStorage
    const storedLocale = localStorage.getItem('preferred-locale');
    if (storedLocale && ['hy', 'en', 'ru'].includes(storedLocale)) {
      return storedLocale;
    }

    // Final fallback
    return 'hy';
  }

  // Public methods
  get<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return this.client.get<T>(url, config);
  }

  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.post<T>(url, data, config);
  }

  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.put<T>(url, data, config);
  }

  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.patch<T>(url, data, config);
  }

  delete<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
