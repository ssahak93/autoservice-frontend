import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Lazy loading utility with feature flag support
 *
 * Usage:
 * const LazyComponent = createLazyComponent(() => import('./HeavyComponent'));
 */

interface LazyComponentOptions {
  loading?: ComponentType | (() => JSX.Element | null);
  ssr?: boolean;
  enabled?: boolean | (() => boolean);
}

/**
 * Creates a lazy-loaded component with optional feature flag check
 */
export function createLazyComponent<T extends ComponentType<Record<string, unknown>>>(
  importFn: () => Promise<{ default: T } | { [key: string]: T }>,
  options: LazyComponentOptions = {}
): ComponentType<Record<string, unknown>> {
  const { loading, ssr = false, enabled = true } = options;

  // Check if feature is enabled
  const isEnabled = typeof enabled === 'function' ? enabled() : enabled;

  if (!isEnabled) {
    // Return a no-op component if disabled
    return () => null;
  }

  return dynamic(importFn, {
    loading: loading || (() => null),
    ssr,
  });
}

/**
 * Default loading component
 */
export function DefaultLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
    </div>
  );
}

/**
 * Skeleton loading component
 */
export function SkeletonLoading({ className = 'h-96 w-full' }: { className?: string }) {
  return <div className={`${className} animate-pulse rounded-lg bg-neutral-200`} />;
}
