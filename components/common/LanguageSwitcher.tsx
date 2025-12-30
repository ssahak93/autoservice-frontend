'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useLocale } from 'next-intl';
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
        className="glass-light flex items-center gap-2 rounded-lg px-3 py-2 transition-all hover:scale-105"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden text-sm font-medium sm:inline">{currentLanguage.flag}</span>
        <span className="hidden text-sm font-medium md:inline">{currentLanguage.name}</span>
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
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-light absolute right-0 top-full z-20 mt-2 min-w-[180px] rounded-lg p-2 shadow-xl"
            >
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    locale === language.code
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{language.flag}</span>
                    <span>{language.name}</span>
                    {locale === language.code && (
                      <span className="ml-auto text-primary-600">✓</span>
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
