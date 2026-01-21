import dynamic from 'next/dynamic';
import { getTranslations } from 'next-intl/server';

import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { HeroSearch } from '@/components/home/HeroSearch';
import { Link } from '@/i18n/routing';
import { SkeletonLoading } from '@/lib/utils/lazy-loading';

// Lazy load heavy components to improve initial page load
const RecommendationsSection = dynamic(
  () =>
    import('@/components/home/RecommendationsSection').then((mod) => ({
      default: mod.RecommendationsSection,
    })),
  {
    loading: () => <SkeletonLoading className="h-96 w-full" />,
    ssr: true,
  }
);

const RecentSearches = dynamic(
  () => import('@/components/home/RecentSearches').then((mod) => ({ default: mod.RecentSearches })),
  {
    loading: () => <SkeletonLoading className="h-48 w-full" />,
    ssr: false, // Client-side only (requires user auth state)
  }
);

const RecentViews = dynamic(
  () => import('@/components/home/RecentViews').then((mod) => ({ default: mod.RecentViews })),
  {
    loading: () => <SkeletonLoading className="h-48 w-full" />,
    ssr: false, // Client-side only (requires user auth state)
  }
);

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations('home');

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 animate-gradient bg-gradient-hero" />

      {/* Language Switcher */}
      <div className="absolute right-4 top-4 z-20">
        <LanguageSwitcher />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 flex min-h-[80vh] flex-col items-center justify-center px-4">
        <div className="max-w-4xl space-y-8 text-center">
          <h1 className="font-display text-5xl font-bold text-white md:text-7xl">{t('title')}</h1>
          <p className="text-xl text-white/90 md:text-2xl">{t('subtitle')}</p>

          {/* Search Bar */}
          <div className="mt-8">
            <HeroSearch />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/services"
              className="glass-light rounded-lg px-8 py-4 font-semibold text-white transition-transform hover:scale-105"
            >
              {t('browseServices')}
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-white px-8 py-4 font-semibold text-primary-600 transition-transform hover:scale-105"
            >
              {t('getStarted')}
            </Link>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="relative z-10 bg-white py-16">
        <div className="container mx-auto px-4">
          <RecommendationsSection locale={locale} />
        </div>
      </div>

      {/* History Section */}
      <div className="relative z-10 border-t border-neutral-200 bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <RecentSearches />
            </div>
            <div>
              <RecentViews />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
