import { useQuery } from '@tanstack/react-query';

import { locationsService, type City, type Location } from '@/lib/services/locations.service';

/**
 * Hook for fetching regions
 */
export function useRegions() {
  return useQuery<Location[]>({
    queryKey: ['locations', 'regions'],
    queryFn: () => locationsService.getRegions(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - regions don't change often
  });
}

/**
 * Hook for fetching cities
 */
export function useCities(regionCode?: string) {
  return useQuery<City[]>({
    queryKey: ['locations', 'cities', regionCode],
    queryFn: () => locationsService.getCities(regionCode),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: true, // Always fetch, regionCode is optional
  });
}

/**
 * Hook for fetching districts (only for Yerevan)
 */
export function useDistricts(cityCode?: string) {
  return useQuery<Location[]>({
    queryKey: ['locations', 'districts', cityCode],
    queryFn: () => {
      if (!cityCode) {
        return Promise.resolve([]);
      }
      return locationsService.getDistricts(cityCode);
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: !!cityCode && cityCode.toLowerCase() === 'yerevan', // Only fetch for Yerevan
  });
}

/**
 * Combined hook for all location data
 */
export function useLocations() {
  return {
    useRegions,
    useCities,
    useDistricts,
  };
}
