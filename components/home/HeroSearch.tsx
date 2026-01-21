'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useCallback } from 'react';

import { Button } from '@/components/ui/Button';
import { useRouter } from '@/i18n/routing';

/**
 * HeroSearch Component
 *
 * Большой поисковый компонент для главной страницы
 */
export function HeroSearch() {
  const t = useTranslations('home');
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = useCallback(() => {
    if (!query.trim()) {
      // Если запрос пустой, просто переходим на страницу услуг
      // router из next-intl автоматически добавляет locale префикс
      router.push('/services');
      return;
    }

    // Переход на страницу услуг с поисковым запросом
    // router из next-intl автоматически добавляет locale префикс
    const params = new URLSearchParams();
    params.set('query', query.trim());
    router.push(`/services?${params.toString()}`);
  }, [query, router]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch]
  );

  return (
    <div className="w-full max-w-3xl">
      <div className="glass-light flex flex-col gap-4 rounded-2xl p-6 sm:flex-row sm:gap-2 sm:p-4">
        <div className="flex flex-1 items-center gap-3 rounded-xl bg-white/90 px-4 py-3 focus-within:ring-2 focus-within:ring-primary-500">
          <Search className="h-5 w-5 flex-shrink-0 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('searchPlaceholder', {
              defaultValue: 'Search for auto services, shops, car washes...',
            })}
            className="flex-1 bg-transparent text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          />
        </div>
        <Button
          onClick={handleSearch}
          size="lg"
          className="whitespace-nowrap px-8 py-3 text-base font-semibold"
        >
          {t('search', { defaultValue: 'Search' })}
        </Button>
      </div>
      <p className="mt-4 text-center text-sm text-white/80">
        {t('searchHint', {
          defaultValue: 'Find the best auto services near you',
        })}
      </p>
    </div>
  );
}
