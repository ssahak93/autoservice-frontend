'use client';

import { ServiceCardSkeleton } from '@/components/auto-service';

interface SearchResultsSkeletonProps {
  count?: number;
  layout?: 'grid' | 'list';
}

/**
 * SearchResultsSkeleton Component
 *
 * Enhanced loading skeleton for search results with shimmer effect
 */
export function SearchResultsSkeleton({ count = 6, layout = 'grid' }: SearchResultsSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Results count skeleton */}
      <div className="h-5 w-32 animate-pulse rounded bg-neutral-200" />

      {/* Cards skeleton */}
      <div
        className={
          layout === 'grid' ? 'grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2' : 'space-y-4'
        }
      >
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="glass-light overflow-hidden rounded-xl"
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            <ServiceCardSkeleton layout={layout} />
          </div>
        ))}
      </div>
    </div>
  );
}
