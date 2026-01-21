'use client';

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { useState } from 'react';

import { queryConfig } from '@/lib/api/query-config';
import {
  logError,
  getUserFriendlyErrorMessage,
  isUnauthorizedError,
  isNoRefreshTokenError,
} from '@/lib/utils/errorHandler';
import { useUIStore } from '@/stores/uiStore';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            // Don't show toast for 401 errors (handled by auth interceptor)
            if (isUnauthorizedError(error)) {
              return;
            }

            // Don't show toast for "No refresh token" errors (handled silently by auth interceptor)
            if (isNoRefreshTokenError(error)) {
              // Silently ignore - this is expected when user is not logged in
              return;
            }

            // Log error for debugging
            logError(error, 'ReactQuery');

            // Show user-friendly error message
            const errorMessage = getUserFriendlyErrorMessage(error);
            useUIStore.getState().showToast(errorMessage, 'error');
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            // Don't show toast for 401 errors (handled by auth interceptor)
            if (isUnauthorizedError(error)) {
              return;
            }

            // Don't show toast for "No refresh token" errors (handled silently by auth interceptor)
            if (isNoRefreshTokenError(error)) {
              // Silently ignore - this is expected when user is not logged in
              return;
            }

            // Log error for debugging
            logError(error, 'ReactQueryMutation');

            // Show user-friendly error message
            const errorMessage = getUserFriendlyErrorMessage(error);
            useUIStore.getState().showToast(errorMessage, 'error');
          },
        }),
        defaultOptions: {
          queries: {
            // Use centralized config
            staleTime: queryConfig.staleTime,
            gcTime: queryConfig.gcTime,
            refetchOnWindowFocus: queryConfig.refetchOnWindowFocus,
            refetchOnReconnect: queryConfig.refetchOnReconnect,
            refetchOnMount: queryConfig.refetchOnMount,
            // Retry failed requests (except for 4xx errors)
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors (client errors)
              if (error && typeof error === 'object') {
                const errorObj = error as unknown as { response?: { status?: number } };
                const status = errorObj.response?.status;
                if (status && status >= 400 && status < 500) {
                  return false;
                }
              }
              // Use config retry count
              return failureCount < queryConfig.retry;
            },
            retryDelay: queryConfig.retryDelay,
          },
          mutations: {
            // Don't retry mutations by default (user actions should not be retried automatically)
            retry: false,
            // Optimize mutation error handling
            onError: (error) => {
              // Errors are handled in mutationCache, but we can add additional logic here
              logError(error, 'Mutation');
            },
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
