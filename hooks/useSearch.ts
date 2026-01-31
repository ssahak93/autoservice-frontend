'use client';

import { useSearchParams as useNextSearchParams } from 'next/navigation';
import { useCallback, useMemo, useRef } from 'react';

import { useRouter, usePathname } from '@/i18n/routing';
import type { ServiceSearchParams } from '@/lib/services/services.service';
import {
  deserializeSearchParams,
  getDefaultSearchParams,
  serializeSearchParams,
} from '@/lib/utils/searchParams';

/**
 * Custom hook for managing search state with URL synchronization.
 * URL is the single source of truth - state is derived from URL on every render.
 * Follows SOLID principles:
 * - Single Responsibility: Manages only search state and URL sync
 * - Dependency Inversion: Abstracts Next.js router and URL handling
 */
export function useSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const nextSearchParams = useNextSearchParams();

  // Use ref to prevent infinite loops when updating search params
  const isUpdatingRef = useRef(false);

  // Derive searchParams directly from URL on every render (URL is source of truth)
  // Use string comparison to prevent unnecessary recalculations
  const searchParamsStringRef = useRef<string>('');
  const searchParams = useMemo<ServiceSearchParams>(() => {
    const currentString = nextSearchParams?.toString() || '';
    // Only recalculate if URL actually changed
    if (currentString !== searchParamsStringRef.current) {
      searchParamsStringRef.current = currentString;
      if (nextSearchParams && nextSearchParams.toString()) {
        const urlParams = new URLSearchParams();
        nextSearchParams.forEach((value, key) => {
          urlParams.set(key, value);
        });
        return deserializeSearchParams(urlParams);
      }
      return getDefaultSearchParams();
    }
    // Return cached params if URL didn't change
    if (nextSearchParams && nextSearchParams.toString()) {
      const urlParams = new URLSearchParams();
      nextSearchParams.forEach((value, key) => {
        urlParams.set(key, value);
      });
      return deserializeSearchParams(urlParams);
    }
    return getDefaultSearchParams();
  }, [nextSearchParams]);

  // Update search parameters and sync with URL
  const updateSearch = useCallback(
    (
      updates: Partial<ServiceSearchParams>,
      options?: { replace?: boolean; resetPage?: boolean }
    ) => {
      // Prevent infinite loops - don't update if already updating
      if (isUpdatingRef.current) {
        return;
      }

      // Mark that we're updating
      isUpdatingRef.current = true;

      const newParams: ServiceSearchParams = {
        ...searchParams,
        ...updates,
        ...(options?.resetPage ? { page: 1 } : {}),
      };

      const serialized = serializeSearchParams(newParams);
      const urlString = serialized.toString();
      const currentUrl = `${pathname}${nextSearchParams?.toString() ? `?${nextSearchParams.toString()}` : ''}`;
      const newUrl = `${pathname}${urlString ? `?${urlString}` : ''}`;

      // Don't update if URL is already the same (prevents unnecessary navigation)
      if (currentUrl === newUrl) {
        isUpdatingRef.current = false;
        return;
      }

      if (options?.replace) {
        router.replace(newUrl);
      } else {
        router.push(newUrl);
      }

      // Reset flag after URL navigation completes
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
    },
    [searchParams, pathname, router, nextSearchParams]
  );

  // Reset all filters
  const resetSearch = useCallback(() => {
    const defaultParams = getDefaultSearchParams();
    const serialized = serializeSearchParams(defaultParams);
    router.push(`${pathname}?${serialized.toString()}`);
  }, [pathname, router]);

  // Update a single filter
  const setFilter = useCallback(
    (key: keyof ServiceSearchParams, value: string | number | undefined) => {
      updateSearch({ [key]: value || undefined }, { resetPage: key !== 'page' && key !== 'limit' });
    },
    [updateSearch]
  );

  return {
    searchParams,
    updateSearch,
    resetSearch,
    setFilter,
  };
}
