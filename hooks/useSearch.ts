'use client';

import { useSearchParams as useNextSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { useRouter, usePathname } from '@/i18n/routing';
import type { ServiceSearchParams } from '@/lib/services/services.service';
import {
  deserializeSearchParams,
  getDefaultSearchParams,
  serializeSearchParams,
} from '@/lib/utils/searchParams';

/**
 * Custom hook for managing search state with URL synchronization.
 * Follows SOLID principles:
 * - Single Responsibility: Manages only search state and URL sync
 * - Dependency Inversion: Abstracts Next.js router and URL handling
 */
export function useSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const nextSearchParams = useNextSearchParams();

  // Initialize from Next.js search params (SSR-safe)
  const [searchParams, setSearchParams] = useState<ServiceSearchParams>(() => {
    // Use nextSearchParams which is SSR-safe
    if (nextSearchParams) {
      const urlParams = new URLSearchParams();
      nextSearchParams.forEach((value, key) => {
        urlParams.set(key, value);
      });
      const params = deserializeSearchParams(urlParams);
      // If we have any meaningful params, use them; otherwise use defaults
      if (
        params.query ||
        params.city ||
        params.region ||
        params.district ||
        params.serviceType ||
        params.businessType ||
        params.regionId ||
        params.communityId
      ) {
        return params;
      }
    }
    return getDefaultSearchParams();
  });

  // Sync with URL search params changes (from browser navigation or SSR)
  useEffect(() => {
    if (nextSearchParams) {
      const urlParams = new URLSearchParams();
      nextSearchParams.forEach((value, key) => {
        urlParams.set(key, value);
      });
      const params = deserializeSearchParams(urlParams);
      // Only update if different from current state
      const currentSerialized = serializeSearchParams(searchParams).toString();
      const urlSerialized = urlParams.toString();
      if (currentSerialized !== urlSerialized) {
        setSearchParams(params);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextSearchParams?.toString()]);

  // Update search parameters and sync with URL
  const updateSearch = useCallback(
    (
      updates: Partial<ServiceSearchParams>,
      options?: { replace?: boolean; resetPage?: boolean }
    ) => {
      const newParams: ServiceSearchParams = {
        ...searchParams,
        ...updates,
        ...(options?.resetPage ? { page: 1 } : {}),
      };

      setSearchParams(newParams);

      const serialized = serializeSearchParams(newParams);
      const newUrl = `${pathname}?${serialized.toString()}`;

      if (options?.replace) {
        router.replace(newUrl);
      } else {
        router.push(newUrl);
      }
    },
    [searchParams, pathname, router]
  );

  // Reset all filters
  const resetSearch = useCallback(() => {
    const defaultParams = getDefaultSearchParams();
    setSearchParams(defaultParams);
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
