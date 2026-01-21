/**
 * Server-side API client for Next.js App Router
 * This client doesn't use cookies/auth and is for public endpoints only
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

class ServerApiClient {
  private client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /**
   * Get data from API endpoint
   */
  async get<T>(
    url: string,
    config?: { params?: Record<string, unknown>; headers?: Record<string, string> }
  ): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // If 404, throw error with message that can be caught and handled
        if (error.response?.status === 404) {
          const errorMessage =
            error.response?.data?.error?.message || error.response?.data?.message || 'Not found';
          const notFoundError = new Error(errorMessage) as Error & {
            status?: number;
            code?: string;
          };
          notFoundError.status = 404;
          notFoundError.code = 'NOT_FOUND';
          throw notFoundError;
        }
        throw new Error(
          error.response?.data?.error?.message ||
            error.response?.data?.message ||
            error.message ||
            'API request failed'
        );
      }
      throw error;
    }
  }
}

export const serverApiClient = new ServerApiClient();
