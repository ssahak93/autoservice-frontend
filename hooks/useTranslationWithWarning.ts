'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

/**
 * Enhanced translation hook with missing translation warnings
 * 
 * @example
 * ```tsx
 * const t = useTranslationWithWarning('services');
 * return <h1>{t('title')}</h1>;
 * ```
 */
export function useTranslationWithWarning(namespace?: string) {
  const t = useTranslations(namespace);
  const locale = useLocale();

  return (key: string, values?: Record<string, string | number>) => {
    try {
      const translation = t(key, values);

      // Check if translation is missing
      // next-intl returns the key path when translation is missing
      const expectedKey = namespace ? `${namespace}.${key}` : key;
      const isMissing =
        translation === key ||
        translation === expectedKey ||
        translation.startsWith('missing translation');

      if (isMissing && process.env.NODE_ENV === 'development') {
        console.warn(
          `[i18n] ⚠️ Missing translation`,
          {
            locale,
            namespace: namespace || 'common',
            key,
            fullKey: expectedKey,
            received: translation,
          }
        );
      }

      return translation;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(
          `[i18n] ❌ Translation error`,
          {
            locale,
            namespace: namespace || 'common',
            key,
            error,
          }
        );
      }
      // Return key as fallback
      return key;
    }
  };
}

