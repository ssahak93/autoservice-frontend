'use client';

import dynamic from 'next/dynamic';

import { LazyWrapper } from '@/components/common/LazyWrapper';
import { SkeletonLoading } from '@/lib/utils/lazy-loading';

// Client-side only components (require user auth state)
// Respects lazy_loading feature flag
const RecentSearches = dynamic(
  () => import('@/components/home/RecentSearches').then((mod) => ({ default: mod.RecentSearches })),
  {
    loading: () => <SkeletonLoading className="h-48 w-full" />,
    ssr: false,
  }
);

const RecentViews = dynamic(
  () => import('@/components/home/RecentViews').then((mod) => ({ default: mod.RecentViews })),
  {
    loading: () => <SkeletonLoading className="h-48 w-full" />,
    ssr: false,
  }
);

export function ClientOnlySections() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <LazyWrapper checkLazyLoading={true}>
        <RecentSearches />
      </LazyWrapper>
      <LazyWrapper checkLazyLoading={true}>
        <RecentViews />
      </LazyWrapper>
    </div>
  );
}
