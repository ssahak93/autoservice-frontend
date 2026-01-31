// i18n utility functions

import { useTranslations } from 'next-intl';

import { defaultLocale, locales, type Locale } from '@/i18n/routing';

/**
 * Hook to get translations with type safety and missing translation warnings
 */
export function useT(namespace?: string) {
  const t = useTranslations(namespace);

  // Return wrapped translation function that logs missing keys
  return (key: string, values?: Record<string, string | number>) => {
    try {
      const translation = t(key, values);

      // Check if translation is missing (returns the key itself)
      if (translation === key || translation === `${namespace || 'common'}.${key}`) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[i18n] Missing translation: ${namespace ? `${namespace}.` : ''}${key}`, {
            namespace,
            key,
            locale:
              typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'unknown',
          });
        }
      }

      return translation;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(
          `[i18n] Translation error for key: ${namespace ? `${namespace}.` : ''}${key}`,
          error
        );
      }
      // Return key as fallback
      return key;
    }
  };
}

/**
 * Format translation with variables
 */
export function formatTranslation(
  translation: string,
  variables: Record<string, string | number>
): string {
  let formatted = translation;
  Object.entries(variables).forEach(([key, value]) => {
    formatted = formatted.replace(`{${key}}`, String(value));
  });
  return formatted;
}

/**
 * Get current locale from URL or storage
 */
export function getCurrentLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale; // Default for SSR
  }

  // Get from URL first (most reliable)
  const pathname = window.location.pathname;
  const localeMatch = pathname.match(/^\/(hy|en|ru)/);
  if (localeMatch && locales.includes(localeMatch[1] as Locale)) {
    return localeMatch[1] as Locale;
  }

  // Fallback to localStorage
  const storedLocale = localStorage.getItem('preferred-locale');
  if (storedLocale && locales.includes(storedLocale as Locale)) {
    return storedLocale as Locale;
  }

  // Final fallback
  return defaultLocale;
}

/**
 * Store preferred locale
 */
export function setPreferredLocale(locale: Locale): void {
  if (typeof window !== 'undefined' && locales.includes(locale)) {
    localStorage.setItem('preferred-locale', locale);
  }
}
