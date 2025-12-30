'use client';

import { ReviewList } from '@/components/reviews/ReviewList';

interface ServiceDetailClientProps {
  serviceId: string;
}

/**
 * Client component for service detail page interactive parts
 * This allows server-side rendering of the main content while keeping
 * interactive parts (like reviews) as client components
 */
export function ServiceDetailClient({ serviceId }: ServiceDetailClientProps) {
  return <ReviewList serviceId={serviceId} />;
}

