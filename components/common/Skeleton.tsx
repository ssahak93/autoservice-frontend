'use client';

import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-neutral-200';
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return <div className={cn(baseClasses, variantClasses[variant], className)} />;
}

export function SkeletonCard() {
  return (
    <div className="glass-light overflow-hidden rounded-xl">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton variant="text" className="h-6 w-3/4" />
        <Skeleton variant="text" className="h-4 w-full" />
        <Skeleton variant="text" className="h-4 w-2/3" />
      </div>
    </div>
  );
}

