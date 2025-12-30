// i18n utility functions

import { useTranslations } from 'next-intl';

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
          console.warn(
            `[i18n] Missing translation: ${namespace ? `${namespace}.` : ''}${key}`,
            {
              namespace,
              key,
              locale: typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'unknown',
            }
          );
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
export function getCurrentLocale(): string {
  if (typeof window === 'undefined') {
    return 'hy'; // Default for SSR
  }

  // Get from URL first (most reliable)
  const pathname = window.location.pathname;
  const localeMatch = pathname.match(/^\/(hy|en|ru)/);
  if (localeMatch) {
    return localeMatch[1];
  }

  // Fallback to localStorage
  const storedLocale = localStorage.getItem('preferred-locale');
  if (storedLocale && ['hy', 'en', 'ru'].includes(storedLocale)) {
    return storedLocale;
  }

  // Final fallback
  return 'hy';
}

/**
 * Store preferred locale
 */
export function setPreferredLocale(locale: string): void {
  if (typeof window !== 'undefined' && ['hy', 'en', 'ru'].includes(locale)) {
    localStorage.setItem('preferred-locale', locale);
  }
}
