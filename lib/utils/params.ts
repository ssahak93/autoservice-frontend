/**
 * Utility functions for cleaning and preparing request parameters
 *
 * Single Responsibility: Handle parameter cleaning and normalization
 */

/**
 * Clean request parameters by removing undefined, null, and empty string values
 * Handles arrays (only includes non-empty arrays)
 *
 * @param params - Parameters object to clean
 * @returns Cleaned parameters object
 */
export function cleanParams<T extends Record<string, unknown>>(params: T): Record<string, unknown> {
  const cleanParams: Record<string, unknown> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // Handle arrays (for multiple selections)
      if (Array.isArray(value) && value.length > 0) {
        cleanParams[key] = value;
      } else if (!Array.isArray(value)) {
        cleanParams[key] = value;
      }
    }
  });

  return cleanParams;
}

/**
 * Build query parameters from an object
 * Converts object to URLSearchParams or plain object for axios
 *
 * @param params - Parameters object
 * @param useURLSearchParams - Whether to return URLSearchParams (default: false, returns object)
 * @returns URLSearchParams or cleaned parameters object
 */
export function buildQueryParams<T extends Record<string, unknown>>(
  params: T,
  useURLSearchParams: boolean = false
): URLSearchParams | Record<string, unknown> {
  const cleaned = cleanParams(params);

  if (useURLSearchParams) {
    const searchParams = new URLSearchParams();
    Object.entries(cleaned).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item !== undefined && item !== null) {
            searchParams.append(key, String(item));
          }
        });
      } else {
        searchParams.append(key, String(value));
      }
    });
    return searchParams;
  }

  return cleaned;
}
