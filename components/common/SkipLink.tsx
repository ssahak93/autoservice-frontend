'use client';

import { useTranslations } from 'next-intl';

/**
 * SkipLink Component
 *
 * Provides keyboard navigation to skip to main content
 * Improves accessibility for screen reader users
 */
export function SkipLink() {
  const t = useTranslations('common');

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
      {t('skipToMain', { defaultValue: 'Skip to main content' })}
    </a>
  );
}
