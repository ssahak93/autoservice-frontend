/**
 * React Query Configuration
 *
 * Centralized configuration for React Query defaults
 */

export const queryConfig = {
  // Default stale time (5 minutes)
  staleTime: 5 * 60 * 1000,

  // Default cache time (10 minutes)
  gcTime: 10 * 60 * 1000,

  // Retry configuration
  retry: 2,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),

  // Refetch configuration
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  refetchOnMount: true,

  // Common refetch intervals (in milliseconds)
  refetchIntervals: {
    notifications: 30000, // 30 seconds for notifications
    stats: 30000, // 30 seconds for stats
  },

  // Common stale times for different data types (in milliseconds)
  staleTimes: {
    default: 5 * 60 * 1000, // 5 minutes
    long: 30 * 60 * 1000, // 30 minutes (for rarely changing data like service types)
    veryLong: 24 * 60 * 60 * 1000, // 24 hours (for locations)
  },
};

/**
 * Query keys factory for type-safe query keys
 */
export const queryKeys = {
  // Services
  services: (params?: unknown) => ['services', params] as const,
  service: (id: string) => ['service', id] as const,
  serviceReviews: (id: string, params?: unknown) => ['service-reviews', id, params] as const,

  // Visits
  visits: (params?: unknown) => ['visits', params] as const,
  visit: (id: string) => ['visit', id] as const,
  visitHistory: (id: string) => ['visit-history', id] as const,

  // Profile
  autoServiceProfile: (id?: string) => ['autoServiceProfile', id] as const,

  // Notifications
  notifications: (params?: unknown) => ['notifications', params] as const,
  notificationStats: () => ['notifications', 'stats'] as const,

  // Feature flags
  featureFlags: () => ['featureFlags'] as const,
  featureFlag: (key: string) => ['featureFlag', key] as const,

  // Favorites
  favorites: () => ['favorites'] as const,
  favorite: (profileId: string) => ['favorite', profileId] as const,

  // Analytics
  analytics: (profileId: string, period?: string) => ['analytics', profileId, period] as const,

  // Search
  searchSuggestions: (query: string) => ['searchSuggestions', query] as const,
  recentSearches: () => ['recentSearches'] as const,
  recentViews: () => ['recentViews'] as const,

  // Recommendations
  recommendations: (params?: unknown) => ['recommendations', params] as const,

  // Vehicles
  vehicles: () => ['vehicles'] as const,
  vehicle: (id: string) => ['vehicle', id] as const,

  // Settings
  settings: () => ['settings'] as const,

  // Locations
  regions: () => ['regions'] as const,
  communities: (regionId?: string, type?: string) => ['communities', regionId, type] as const,

  // Service Types
  serviceTypes: () => ['service-types', 'all'] as const,
  serviceTypesByCategory: (category: string) => ['service-types', 'category', category] as const,
};
