import type { User } from '@/types';

/**
 * Auth response utilities
 *
 * Single Responsibility: Handle auth response unwrapping
 */

export interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthResponse {
  success?: boolean;
  data?: AuthResponseData;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
}

/**
 * Unwrap auth response data
 * Backend may return data directly or wrapped in {success, data}
 *
 * @param response - Auth response from API
 * @returns Unwrapped auth data or null if invalid
 */
export function unwrapAuthResponse(response: AuthResponse): AuthResponseData | null {
  // Check if response is wrapped in {success, data}
  if (response.success && response.data) {
    return response.data;
  }

  // Check if response has direct fields
  if (response.accessToken && response.refreshToken && response.user) {
    return {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      user: response.user,
    };
  }

  return null;
}
