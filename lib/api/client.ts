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
        const locale = getCurrentLocale();
        if (config.headers) {
          config.headers['Accept-Language'] = locale;
          config.headers['X-Locale'] = locale; // Custom header for explicit locale
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // Don't log 404 errors for notifications/stats endpoint (expected if not implemented)
        const url = error.config?.url || '';
        const isNotificationsStats = url.includes('/notifications/stats');

        if (error.response?.status === 401) {
          // Check if this is a login/register request - don't try to refresh token
          const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/register');

          if (isAuthRequest) {
            // For login/register, just reject the error - no redirect
            return Promise.reject(error);
          }

          // For other requests, token expired - try to refresh
          try {
            await this.refreshToken();
            // Retry original request
            if (error.config) {
              return this.client.request(error.config);
            }
          } catch (refreshError) {
            // Refresh failed, logout and dispatch event for redirect
            this.logout();
            if (typeof window !== 'undefined') {
              // Dispatch custom event for locale-aware redirect
              // AuthLogoutHandler will handle the redirect
              window.dispatchEvent(new CustomEvent('auth:logout'));
            }
          }
        } else if (error.response?.status === 404 && isNotificationsStats) {
          // Silently handle 404 for notifications/stats - this is expected if endpoint not implemented
          // Return a rejected promise with a special flag so the service can handle it
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

    if (response.data?.data) {
      this.setTokens(response.data.data.accessToken, response.data.data.refreshToken);
    }
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
