import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
} from 'axios';

import { getCurrentLocale } from '@/lib/utils/i18n';

import { requestOptimizer } from './request-optimizer';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

class ApiClient {
  private client: AxiosInstance;
  private requestQueue: Map<string, Promise<unknown>> = new Map();

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds timeout
      paramsSerializer: (params) => {
        // Custom serializer to handle arrays without [] brackets
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value === undefined || value === null) {
            return;
          }
          if (Array.isArray(value)) {
            // For arrays, append each value with the same key (no brackets)
            value.forEach((item) => {
              if (item !== undefined && item !== null) {
                searchParams.append(key, String(item));
              }
            });
          } else {
            searchParams.append(key, String(value));
          }
        });
        return searchParams.toString();
      },
    });

    // Request interceptor for auth token, locale, and optimization
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
        }

        // For FormData, don't optimize and let browser set Content-Type with boundary
        // Check both config.data and the original data passed to post/put methods
        const isFormData = config.data instanceof FormData;

        if (isFormData) {
          // Remove Content-Type header to let browser set it with boundary
          // This is critical for multipart/form-data uploads
          if (config.headers) {
            delete config.headers['Content-Type'];
          }
          // Ensure axios doesn't serialize FormData
          config.transformRequest = [];
        }

        // Optimize request payload (skip FormData - it's already optimized for file uploads)
        if (config.data && typeof config.data === 'object' && !isFormData) {
          config.data = requestOptimizer.optimizePayload(config.data);

          // Validate payload size
          if (!requestOptimizer.validatePayloadSize(config.data)) {
            console.warn('Request payload exceeds maximum size:', config.url);
          }
        }

        // Optimize query params
        if (config.params && typeof config.params === 'object') {
          config.params = requestOptimizer.optimizeQueryParams(config.params);
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

          // Check if this is a history/search/feature-flags request - these are optional and shouldn't trigger logout
          const isOptionalRequest =
            url.includes('/search/history') ||
            url.includes('/search/recent') ||
            url.includes('/feature-flags') ||
            url.includes('/notifications/stats');

          if (isAuthRequest) {
            // For login/register/me, just reject the error - no redirect
            return Promise.reject(error);
          }

          if (isOptionalRequest) {
            // For optional requests (history, stats), just reject the error - no logout
            // These endpoints are optional and may return 401 for unauthenticated users
            // Mark error as silent to prevent console logging in services
            (error as { silent?: boolean }).silent = true;
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

    // Get locale for headers
    const locale = getCurrentLocale();

    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      {
        headers: {
          'Accept-Language': locale,
        },
      }
    );

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
      // Also save to cookies for middleware access
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `accessToken=${accessToken}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
    }
  }

  private logout(): void {
    if (typeof window !== 'undefined') {
      // Clear localStorage tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // Also clear cookies
      document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

      // Clear auth store (Zustand)
      // Use dynamic import to avoid circular dependency
      import('@/stores/authStore').then(({ useAuthStore }) => {
        useAuthStore.getState().logout();
      });

      // Clear React Query cache
      // Dispatch event that will be handled by a component that has access to queryClient
      window.dispatchEvent(new CustomEvent('auth:clear-cache'));
    }
  }

  // Removed getCurrentLocale - using getCurrentLocale from @/lib/utils/i18n instead

  // Public methods with request deduplication for GET requests
  get<T = unknown>(url: string, config?: AxiosRequestConfig) {
    const requestKey = `GET:${url}:${JSON.stringify(config?.params || {})}`;

    return requestOptimizer.deduplicate(requestKey, () => {
      return this.client.get<T>(url, config);
    });
  }

  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    // Don't optimize FormData - let interceptor handle it
    const isFormData = data instanceof FormData;
    const optimizedData =
      !isFormData && data && typeof data === 'object'
        ? requestOptimizer.optimizePayload(data as Record<string, unknown>)
        : data;

    return this.client.post<T>(url, optimizedData, config);
  }

  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    // Don't optimize FormData - let interceptor handle it
    const isFormData = data instanceof FormData;
    const optimizedData =
      !isFormData && data && typeof data === 'object'
        ? requestOptimizer.optimizePayload(data as Record<string, unknown>)
        : data;

    return this.client.put<T>(url, optimizedData, config);
  }

  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    // Optimize payload before sending
    const optimizedData =
      data && typeof data === 'object'
        ? requestOptimizer.optimizePayload(data as Record<string, unknown>)
        : data;

    return this.client.patch<T>(url, optimizedData, config);
  }

  delete<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
