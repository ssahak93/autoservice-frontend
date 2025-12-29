import { useTranslations } from 'next-intl';

import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { Link } from '@/i18n/routing';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 animate-gradient bg-gradient-hero" />

      {/* Language Switcher */}
      <div className="absolute right-4 top-4 z-20">
        <LanguageSwitcher />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        <div className="max-w-4xl space-y-8 text-center">
          <h1 className="font-display text-5xl font-bold text-white md:text-7xl">{t('title')}</h1>
          <p className="text-xl text-white/90 md:text-2xl">{t('subtitle')}</p>
          <div className="flex justify-center gap-4">
            <Link
              href="/login"
              className="rounded-lg bg-white px-8 py-4 font-semibold text-primary-600 transition-transform hover:scale-105"
            >
              {t('getStarted')}
            </Link>
            <Link
              href="/services"
              className="glass-light rounded-lg px-8 py-4 font-semibold text-white transition-transform hover:scale-105"
            >
              {t('browseServices')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
