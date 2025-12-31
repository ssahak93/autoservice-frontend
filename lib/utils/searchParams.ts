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

  if (params.city) searchParams.set('city', params.city);
  if (params.region) searchParams.set('region', params.region);
  if (params.district) searchParams.set('district', params.district);
  if (params.serviceType) searchParams.set('serviceType', params.serviceType);
  if (params.minRating) searchParams.set('minRating', params.minRating.toString());
  if (params.latitude) searchParams.set('latitude', params.latitude.toString());
  if (params.longitude) searchParams.set('longitude', params.longitude.toString());
  if (params.radius) searchParams.set('radius', params.radius.toString());
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.query) searchParams.set('query', params.query); // For future text search
  if (params.page && params.page > 1) searchParams.set('page', params.page.toString());
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

  const city = searchParams.get('city');
  if (city) params.city = city;

  const region = searchParams.get('region');
  if (region) params.region = region;

  const district = searchParams.get('district');
  if (district) params.district = district;

  const serviceType = searchParams.get('serviceType');
  if (serviceType) params.serviceType = serviceType;

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
    if (!isNaN(pageNum) && pageNum > 0) params.page = pageNum;
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
