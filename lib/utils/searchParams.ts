/**
 * Utility functions for managing search parameters in URL.
 * Follows SOLID principles:
 * - Single Responsibility: Only handles URL parameter serialization/deserialization
 * - Open/Closed: Extendable for new parameter types without modifying existing code
 */

import type { ServiceSearchParams } from '@/lib/services/services.service';

/**
 * Serialize search parameters to URL search params
 */
export function serializeSearchParams(params: ServiceSearchParams): URLSearchParams {
  const searchParams = new URLSearchParams();

  // Legacy fields removed - use regionId and communityId instead

  // New fields (primary)
  if (params.regionId) searchParams.set('regionId', params.regionId);
  if (params.communityId) searchParams.set('communityId', params.communityId);
  // providerTypes removed - ProviderType model has been removed
  // Support multiple service types
  if (params.serviceTypes && params.serviceTypes.length > 0) {
    params.serviceTypes.forEach((st) => {
      searchParams.append('serviceTypes', st);
    });
  }
  if (params.minRating) searchParams.set('minRating', params.minRating.toString());
  if (params.latitude) searchParams.set('latitude', params.latitude.toString());
  if (params.longitude) searchParams.set('longitude', params.longitude.toString());
  if (params.radius) searchParams.set('radius', params.radius.toString());
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.query) searchParams.set('query', params.query);
  // Always include page (even if it's 1, for consistency and proper pagination)
  // This ensures URL always reflects the current page state
  const page = params.page !== undefined && params.page !== null ? params.page : 1;
  if (page > 0) {
    searchParams.set('page', page.toString());
  }
  if (params.limit && params.limit !== 20) searchParams.set('limit', params.limit.toString());

  return searchParams;
}

/**
 * Deserialize URL search params to search parameters
 */
export function deserializeSearchParams(searchParams: URLSearchParams): ServiceSearchParams {
  const params: ServiceSearchParams = {
    page: 1,
    limit: 20,
  };

  // Legacy fields removed - use regionId and communityId instead

  // New fields (primary)
  const regionId = searchParams.get('regionId');
  if (regionId) params.regionId = regionId;

  const communityId = searchParams.get('communityId');
  if (communityId) params.communityId = communityId;

  // providerTypes removed - ProviderType model has been removed

  // Support multiple service types
  const serviceTypes = searchParams.getAll('serviceTypes');
  if (serviceTypes.length > 0) {
    params.serviceTypes = serviceTypes;
  }

  const minRating = searchParams.get('minRating');
  if (minRating) {
    const rating = parseFloat(minRating);
    if (!isNaN(rating) && rating >= 0 && rating <= 5) {
      params.minRating = rating;
    }
  }

  const latitude = searchParams.get('latitude');
  if (latitude) {
    const lat = parseFloat(latitude);
    if (!isNaN(lat)) params.latitude = lat;
  }

  const longitude = searchParams.get('longitude');
  if (longitude) {
    const lng = parseFloat(longitude);
    if (!isNaN(lng)) params.longitude = lng;
  }

  const radius = searchParams.get('radius');
  if (radius) {
    const rad = parseFloat(radius);
    if (!isNaN(rad) && rad > 0) params.radius = rad;
  }

  const sortBy = searchParams.get('sortBy');
  if (sortBy && ['rating', 'distance', 'reviews', 'newest'].includes(sortBy)) {
    params.sortBy = sortBy as ServiceSearchParams['sortBy'];
  }

  const query = searchParams.get('query');
  if (query) params.query = query;

  const page = searchParams.get('page');
  if (page) {
    const pageNum = parseInt(page, 10);
    if (!isNaN(pageNum) && pageNum > 0) {
      params.page = pageNum;
    }
  } else {
    // If page is not in URL, default to 1 (explicit)
    params.page = 1;
  }

  const limit = searchParams.get('limit');
  if (limit) {
    const limitNum = parseInt(limit, 10);
    if (!isNaN(limitNum) && limitNum > 0) params.limit = limitNum;
  }

  return params;
}

/**
 * Update URL without page reload
 */
export function updateURL(searchParams: URLSearchParams, pathname: string) {
  const newUrl = `${pathname}?${searchParams.toString()}`;
  window.history.pushState({}, '', newUrl);
}

/**
 * Get default search parameters
 */
export function getDefaultSearchParams(): ServiceSearchParams {
  return {
    page: 1,
    limit: 20,
    sortBy: 'rating',
  };
}
