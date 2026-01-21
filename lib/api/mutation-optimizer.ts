/**
 * Mutation Optimizer
 *
 * Provides utilities for optimistic updates and mutation optimization
 */

import { QueryClient } from '@tanstack/react-query';

export interface OptimisticUpdateConfig<TData, TVariables> {
  queryKey: unknown[];
  updateFn: (oldData: TData | undefined, variables: TVariables) => TData;
  rollbackFn?: (oldData: TData | undefined) => void;
}

/**
 * Apply optimistic update to React Query cache
 */
export function applyOptimisticUpdate<TData, TVariables>(
  queryClient: QueryClient,
  config: OptimisticUpdateConfig<TData, TVariables>,
  variables: TVariables
): void {
  const { queryKey, updateFn } = config;

  queryClient.setQueryData<TData>(queryKey, (oldData) => {
    return updateFn(oldData, variables);
  });
}

/**
 * Rollback optimistic update
 */
export function rollbackOptimisticUpdate<TData>(
  queryClient: QueryClient,
  config: OptimisticUpdateConfig<TData, unknown>
): void {
  const { queryKey, rollbackFn } = config;

  if (rollbackFn) {
    const currentData = queryClient.getQueryData<TData>(queryKey);
    rollbackFn(currentData);
  } else {
    // Invalidate query to refetch
    queryClient.invalidateQueries({ queryKey });
  }
}

/**
 * Helper to create optimistic update config for common patterns
 */
export function createOptimisticConfig<TData, TVariables>(
  queryKey: unknown[],
  updateFn: (oldData: TData | undefined, variables: TVariables) => TData
): OptimisticUpdateConfig<TData, TVariables> {
  return {
    queryKey,
    updateFn,
  };
}
