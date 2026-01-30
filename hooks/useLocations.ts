import { useQuery } from '@tanstack/react-query';

import { locationsService, type Region, type Community } from '@/lib/services/locations.service';

/**
 * Hook for fetching regions
 */
export function useRegions() {
  return useQuery<Region[]>({
    queryKey: ['regions'],
    queryFn: () => locationsService.getRegions(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - regions don't change often
  });
}

/**
 * Hook for fetching communities (cities, villages, districts)
 * @param regionId - Optional filter by region ID
 * @param type - Optional filter by community type (city, village, district)
 */
export function useCommunities(regionId?: string, type?: 'city' | 'village' | 'district') {
  return useQuery<Community[]>({
    queryKey: ['communities', regionId, type],
    queryFn: () => locationsService.getCommunities(regionId, type),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: true, // Always fetch, regionId is optional
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
