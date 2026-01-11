'use client';

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { useState } from 'react';

import {
  logError,
  getUserFriendlyErrorMessage,
  isUnauthorizedError,
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

            // Log error for debugging
            logError(error, 'ReactQueryMutation');

            // Show user-friendly error message
            const errorMessage = getUserFriendlyErrorMessage(error);
            useUIStore.getState().showToast(errorMessage, 'error');
          },
        }),
        defaultOptions: {
          queries: {
            // Default stale time: 5 minutes for most queries
            staleTime: 5 * 60 * 1000,
            // Cache time: 30 minutes (data stays in cache after component unmounts)
            gcTime: 30 * 60 * 1000, // Previously cacheTime
            // Don't refetch on window focus by default (better UX)
            refetchOnWindowFocus: false,
            // Retry failed requests once (except for 4xx errors)
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors (client errors)
              if (error && typeof error === 'object') {
                const errorObj = error as Record<string, unknown>;
                const status = errorObj.response?.status as number | undefined;
                if (status && status >= 400 && status < 500) {
                  return false;
                }
              }
              // Retry up to 1 time for other errors
              return failureCount < 1;
            },
            // Retry delay increases exponentially
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch on mount if data is stale
            refetchOnMount: true,
            // Don't refetch on reconnect (WebSocket handles real-time updates)
            refetchOnReconnect: false,
          },
          mutations: {
            // Don't retry mutations by default (user actions should not be retried automatically)
            retry: false,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
