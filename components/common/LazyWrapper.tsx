'use client';

import { ReactNode } from 'react';

import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { SkeletonLoading } from '@/lib/utils/lazy-loading';

interface LazyWrapperProps {
  children: ReactNode;
  featureFlag?: string;
  fallback?: ReactNode;
  className?: string;
}

/**
 * LazyWrapper Component
 *
 * Wraps content that should only render when a feature flag is enabled
 * Shows loading skeleton while checking feature flag
 */
export function LazyWrapper({ children, featureFlag, fallback, className }: LazyWrapperProps) {
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const { isLoading, isEnabled } = useFeatureFlag(featureFlag || '', false);

  if (!featureFlag) {
    return <>{children}</>;
  }

  if (isLoading) {
    return <SkeletonLoading className={className} />;
  }

  if (!isEnabled) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
