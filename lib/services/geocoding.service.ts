/**
 * Geocoding Service
 *
 * Provides geocoding (address → coordinates) and reverse geocoding (coordinates → address)
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 *
 * Rate limit: 1 request per second (we should debounce in UI)
 *
 * Supports multilingual address extraction based on locale (hy, en, ru)
 */

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
  address?: {
    road?: string;
    houseNumber?: string;
    city?: string;
    state?: string; // Region
    country?: string;
    postcode?: string;
  };
}

export interface ReverseGeocodingResult {
  address: string;
  city: string;
  region: string;
  district?: string;
  country: string;
  displayName: string;
}

/**
 * Map locale code to Nominatim language code
 * Nominatim uses ISO 639-1 language codes
 */
function getNominatimLanguage(locale: string): string {
  const localeMap: Record<string, string> = {
    hy: 'hy', // Armenian
    en: 'en', // English
    ru: 'ru', // Russian
  };
  return localeMap[locale] || 'en'; // Default to English
}

export const geocodingService = {
  /**
   * Geocode an address to coordinates
   * @param address - Full address string (e.g., "Yerevan, Tigran Mets Ave 100")
   * @param countryCode - Optional country code to limit search (default: "am" for Armenia)
   * @param locale - Locale code for language-specific results (hy, en, ru)
   */
  async geocode(
    address: string,
    countryCode: string = 'am',
    locale: string = 'en'
  ): Promise<GeocodingResult | null> {
    try {
      const language = getNominatimLanguage(locale);
      // Use Nominatim API (free, no API key required)
      // accept-language header requests results in the specified language
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}&countrycodes=${countryCode}&limit=1&addressdetails=1&accept-language=${language}`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AutoServiceConnect/1.0', // Required by Nominatim
          'Accept-Language': language, // Request results in specific language
        },
      });

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        return null;
      }

      const result = data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        displayName: result.display_name,
        address: result.address || {},
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  },

  /**
   * Reverse geocode coordinates to address
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @param locale - Locale code for language-specific results (hy, en, ru)
   */
  async reverseGeocode(
    latitude: number,
    longitude: number,
    locale: string = 'en'
  ): Promise<ReverseGeocodingResult | null> {
    try {
      const language = getNominatimLanguage(locale);
      // accept-language parameter requests results in the specified language
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=${language}`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AutoServiceConnect/1.0', // Required by Nominatim
          'Accept-Language': language, // Request results in specific language
        },
      });

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || !data.address) {
        return null;
      }

      const addr = data.address;

      // Map Nominatim address fields to our format
      // Nominatim uses different field names depending on country and locale
      // For Armenia, Nominatim may return different field structures
      const city =
        addr.city || addr.town || addr.village || addr.municipality || addr.city_district || '';
      const region = addr.state || addr.region || addr.state_district || '';
      const road = addr.road || addr.street || addr.street_name || '';
      const houseNumber = addr.house_number || addr.house || '';
      // District can be in multiple fields - check suburb, neighbourhood, quarter, city_district
      const district =
        addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || '';

      // For Armenia, if city is "Yerevan" and region is empty, region should also be "Yerevan"
      // This handles cases where Nominatim returns only city without explicit region
      // IMPORTANT: Only do this if city is explicitly Yerevan, not as a fallback
      let finalRegion = region;
      const cityLower = city.toLowerCase();
      if (
        !finalRegion &&
        (cityLower === 'yerevan' ||
          cityLower === 'ереван' ||
          cityLower === 'երեվան' ||
          cityLower === 'yerevan city' ||
          (cityLower.includes('yerevan') &&
            !cityLower.includes('masis') &&
            !cityLower.includes('масис')))
      ) {
        finalRegion = 'Yerevan'; // Will be matched to 'yerevan' code
      }

      // Don't set district if city is not Yerevan
      let finalDistrict = district;
      if (
        finalDistrict &&
        cityLower &&
        cityLower !== 'yerevan' &&
        cityLower !== 'ереван' &&
        cityLower !== 'երեվան'
      ) {
        // Clear district if city is not Yerevan (districts only exist for Yerevan)
        finalDistrict = undefined;
      }

      // Use display_name as the full address - it contains the complete formatted address
      // from Nominatim with all details (street, house number, district, city, region, postcode, country)
      // This is more comprehensive than building from parts
      const fullAddress =
        data.display_name ||
        (() => {
          // Fallback: build address from parts if display_name is not available
          const addressParts = [];
          if (houseNumber && road) {
            addressParts.push(`${road} ${houseNumber}`);
          } else if (road) {
            addressParts.push(road);
          } else if (houseNumber) {
            addressParts.push(houseNumber);
          }

          // Add district if available
          if (district && !addressParts.includes(district)) {
            addressParts.push(district);
          }

          // Add city if not already in address
          if (
            city &&
            !addressParts.some((part) => part.toLowerCase().includes(city.toLowerCase()))
          ) {
            addressParts.push(city);
          }

          // Add postcode if available
          const postcode = addr.postcode || addr.postal_code || '';
          if (postcode && !addressParts.some((part) => part.includes(postcode))) {
            addressParts.push(postcode);
          }

          // Add country if available
          const country = addr.country || 'Armenia';
          if (
            country &&
            !addressParts.some((part) => part.toLowerCase().includes(country.toLowerCase()))
          ) {
            addressParts.push(country);
          }

          return addressParts.join(', ');
        })();

      return {
        address: fullAddress,
        city: city,
        region: finalRegion, // Use finalRegion which handles Yerevan case
        district: finalDistrict || undefined, // Only include district if city is Yerevan
        country: addr.country || 'Armenia',
        displayName: data.display_name,
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  },

  /**
   * Search for addresses (for autocomplete/search)
   * @param query - Search query
   * @param countryCode - Optional country code (default: "am")
   * @param limit - Maximum number of results (default: 5)
   * @param locale - Locale code for language-specific results (hy, en, ru)
   */
  async searchAddresses(
    query: string,
    countryCode: string = 'am',
    limit: number = 5,
    locale: string = 'en'
  ): Promise<Array<{ displayName: string; latitude: number; longitude: number }>> {
    try {
      if (!query || query.length < 3) {
        return [];
      }

      const language = getNominatimLanguage(locale);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&countrycodes=${countryCode}&limit=${limit}&addressdetails=1&accept-language=${language}`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AutoServiceConnect/1.0',
          'Accept-Language': language, // Request results in specific language
        },
      });

      if (!response.ok) {
        throw new Error(`Address search failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || !Array.isArray(data)) {
        return [];
      }

      return data.map((item) => ({
        displayName: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      }));
    } catch (error) {
      console.error('Address search error:', error);
      return [];
    }
  },
};
