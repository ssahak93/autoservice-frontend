import { useQuery } from '@tanstack/react-query';

import { queryKeys, queryConfig } from '@/lib/api/query-config';
import { locationsService, type Region, type Community } from '@/lib/services/locations.service';

/**
 * Hook for fetching regions
 */
export function useRegions() {
  return useQuery<Region[]>({
    queryKey: queryKeys.regions(),
    queryFn: () => locationsService.getRegions(),
    staleTime: queryConfig.staleTimes.veryLong, // 24 hours - regions don't change often
    gcTime: queryConfig.gcTime,
  });
}

/**
 * Hook for fetching communities (cities, villages, districts)
 * @param regionId - Optional filter by region ID
 * @param type - Optional filter by community type (city, village, district)
 */
export function useCommunities(regionId?: string, type?: 'city' | 'village' | 'district') {
  return useQuery<Community[]>({
    queryKey: queryKeys.communities(regionId, type),
    queryFn: () => locationsService.getCommunities(regionId, type),
    staleTime: queryConfig.staleTimes.veryLong, // 24 hours
    gcTime: queryConfig.gcTime,
    // Only fetch if regionId is provided - communities are region-specific
    enabled: !!regionId,
  });
}

/**
 * @deprecated Use useCommunities instead
 * Kept for backward compatibility during migration
 */
export function useCities(regionId?: string) {
  return useCommunities(regionId, 'city');
}

/**
 * @deprecated Use useCommunities instead
 * Kept for backward compatibility during migration
 */
export function useDistricts(regionId?: string) {
  return useCommunities(regionId, 'district');
}

/**
 * Combined hook for all location data
 */
export function useLocations() {
  return {
    useRegions,
    useCommunities,
    useCities, // Deprecated
    useDistricts, // Deprecated
  };
}
