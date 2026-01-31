'use client';

import dynamic from 'next/dynamic';

// Lazy load heavy components (client-side only)
const ServiceMap = dynamic(
  () => import('@/components/services/ServiceMap').then((mod) => ({ default: mod.ServiceMap })),
  {
    loading: () => <div className="h-96 w-full animate-pulse rounded-lg bg-neutral-200" />,
    ssr: false,
  }
);

// Lazy load modal to reduce initial bundle size
const BookVisitModal = dynamic(
  () =>
    import('@/components/visits/BookVisitModal').then((mod) => ({ default: mod.BookVisitModal })),
  {
    loading: () => <div className="h-10 w-32 animate-pulse rounded-lg bg-neutral-200" />,
    ssr: false,
  }
);

interface ServiceMapProps {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  name: string;
}

interface BookVisitModalProps {
  serviceId: string;
  serviceName: string;
}

interface ServiceDetailClientProps {
  serviceId: string;
  profileId: string;
  serviceMapProps?: ServiceMapProps;
  bookVisitModalProps?: BookVisitModalProps;
}

export function ServiceDetailClient({
  serviceId: _serviceId,
  profileId: _profileId,
  serviceMapProps,
  bookVisitModalProps,
}: ServiceDetailClientProps) {
  return (
    <>
      {serviceMapProps && (
        <ServiceMap
          latitude={serviceMapProps.latitude}
          longitude={serviceMapProps.longitude}
          address={serviceMapProps.address}
          city={serviceMapProps.city}
          name={serviceMapProps.name}
        />
      )}
      {bookVisitModalProps && (
        <BookVisitModal
          serviceId={bookVisitModalProps.serviceId}
          serviceName={bookVisitModalProps.serviceName}
        />
      )}
    </>
  );
}
