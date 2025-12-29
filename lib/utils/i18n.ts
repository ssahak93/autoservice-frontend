// i18n utility functions

import { useTranslations } from 'next-intl';

/**
 * Hook to get translations with type safety
 */
export function useT(namespace?: string) {
  return useTranslations(namespace);
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
