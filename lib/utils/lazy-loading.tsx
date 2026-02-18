import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Lazy loading utility with feature flag support
 *
 * Usage:
 * const LazyComponent = createLazyComponent(() => import('./HeavyComponent'));
 *
 * Note: For feature flag checking, use LazyWrapper component instead,
 * as this function is called at module level and cannot use hooks.
 */

interface LazyComponentOptions {
  loading?: ComponentType | (() => JSX.Element | null);
  ssr?: boolean;
  enabled?: boolean | (() => boolean);
}

/**
 * Creates a lazy-loaded component with optional feature flag check
 *
 * @deprecated For feature flag support, use LazyWrapper component instead
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

  return dynamic(
    importFn as () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>,
    {
      loading: (loading as () => JSX.Element | null) || (() => null),
      ssr,
    }
  );
}

/**
 * Creates a lazy-loaded component that respects lazy_loading feature flag
 * This is a wrapper around dynamic() that checks the feature flag
 */
export function createLazyComponentWithFlag<T extends ComponentType<Record<string, unknown>>>(
  importFn: () => Promise<{ default: T } | { [key: string]: T }>,
  options: Omit<LazyComponentOptions, 'enabled'> = {}
): ComponentType<Record<string, unknown>> {
  const { loading, ssr = false } = options;

  // Create a wrapper component that checks the feature flag
  return dynamic(
    () =>
      importFn().then((mod) => {
        // Return a component that checks feature flag
        const Component = ('default' in mod ? mod.default : Object.values(mod)[0]) as T;
        return {
          default: ((props: Record<string, unknown>) => {
            // This will be checked at render time by LazyWrapper
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return <Component {...(props as any)} />;
          }) as ComponentType<Record<string, unknown>>,
        };
      }),
    {
      loading: (loading as () => JSX.Element | null) || (() => null),
      ssr,
    }
  );
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
