import type { Locale } from '@/i18n/routing';

import { getCurrentLocale } from './i18n';

/**
 * Service type with localized fields
 */
export interface LocalizedServiceType {
  id: string;
  name: string;
  nameHy?: string;
  nameRu?: string;
  code: string;
  displayName: string;
  category: {
    id: string;
    code: string;
    name: string;
  };
  group?: {
    id: string;
    code: string;
    name: string;
  };
}

/**
 * Get localized name for service type
 * Uses locale-specific field if available, falls back to default name
 *
 * @param type - Service type with name fields
 * @param locale - Locale to use (defaults to current locale)
 * @returns Localized display name
 */
export function getLocalizedServiceTypeName(
  type: { name: string; nameHy?: string; nameRu?: string },
  locale?: Locale
): string {
  const currentLocale = locale || (getCurrentLocale() as Locale);

  switch (currentLocale) {
    case 'hy':
      return type.nameHy || type.name;
    case 'ru':
      return type.nameRu || type.name;
    case 'en':
    default:
      return type.name;
  }
}

/**
 * Localize array of service types
 * Adds displayName field based on current locale
 *
 * @param types - Array of service types
 * @param locale - Locale to use (defaults to current locale)
 * @returns Array of localized service types
 */
export function localizeServiceTypes<T extends { name: string; nameHy?: string; nameRu?: string }>(
  types: T[],
  locale?: Locale
): Array<T & { displayName: string }> {
  const currentLocale = locale || (getCurrentLocale() as Locale);

  return types.map((type) => ({
    ...type,
    displayName: getLocalizedServiceTypeName(type, currentLocale),
  }));
}
