'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { usePathname, useRouter } from '@/i18n/routing';
import { setPreferredLocale } from '@/lib/utils/i18n';

const languages = [
  { code: 'hy', name: 'Հայերեն', flag: '🇦🇲' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('navigation');

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

  const handleLanguageChange = (newLocale: string) => {
    // Store preference in localStorage
    setPreferredLocale(newLocale);

    // Navigate to new locale
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-light flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label={t('changeLanguage', { defaultValue: 'Change language' })}
        aria-expanded={isOpen}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden text-sm font-medium sm:inline">{currentLanguage.flag}</span>
        <span className="hidden text-sm font-medium md:inline">{currentLanguage.name}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="glass-light absolute right-0 top-full z-20 mt-2 min-w-[200px] rounded-lg border border-neutral-200 bg-white p-2 shadow-xl"
            >
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full rounded-md px-3 py-2.5 text-left text-sm transition-all ${
                    locale === language.code
                      ? 'bg-primary-50 font-medium text-primary-700 shadow-sm'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{language.flag}</span>
                    <span className="flex-1">{language.name}</span>
                    {locale === language.code && (
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs text-white">
                        ✓
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
