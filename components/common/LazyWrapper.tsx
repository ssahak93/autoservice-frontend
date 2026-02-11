'use client';

import { ReactNode } from 'react';

import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { SkeletonLoading } from '@/lib/utils/lazy-loading';

interface LazyWrapperProps {
  children: ReactNode;
  featureFlag?: string;
  fallback?: ReactNode;
  className?: string;
  /**
   * If true, checks lazy_loading feature flag in addition to the provided featureFlag
   * Default: true
   */
  checkLazyLoading?: boolean;
}

/**
 * LazyWrapper Component
 *
 * Wraps content that should only render when a feature flag is enabled
 * Shows loading skeleton while checking feature flag
 *
 * If checkLazyLoading is true (default), also checks lazy_loading feature flag
 */
export function LazyWrapper({
  children,
  featureFlag,
  fallback,
  className,
  checkLazyLoading = true,
}: LazyWrapperProps) {
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const { isLoading: isLoadingFlag, isEnabled: isFlagEnabled } = useFeatureFlag(
    featureFlag || '',
    false
  );
  const { isLoading: isLoadingLazy, isEnabled: isLazyEnabled } = useFeatureFlag(
    'lazy_loading',
    true
  );

  if (!featureFlag && !checkLazyLoading) {
    return <>{children}</>;
  }

  const isLoading = isLoadingFlag || (checkLazyLoading && isLoadingLazy);
  const isEnabled = checkLazyLoading ? isFlagEnabled && isLazyEnabled : isFlagEnabled;

  if (isLoading) {
    return <SkeletonLoading className={className} />;
  }

  if (!isEnabled) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
