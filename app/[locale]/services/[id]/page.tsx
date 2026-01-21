import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ServiceBreadcrumbs } from '@/components/common/ServiceBreadcrumbs';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { ServiceSchema } from '@/components/seo/ServiceSchema';
import { ServiceDetailClient } from '@/components/services/ServiceDetailClient';
import { ServiceGallery } from '@/components/services/ServiceGallery';
import { ServiceInfo } from '@/components/services/ServiceInfo';
// Lazy load heavy components
const ServiceMap = dynamic(
  () => import('@/components/services/ServiceMap').then((mod) => ({ default: mod.ServiceMap })),
  {
    loading: () => <div className="h-96 w-full animate-pulse rounded-lg bg-neutral-200" />,
    ssr: false,
  }
);
import { ServiceTypesList } from '@/components/services/ServiceTypesList';
import { WorkingHours } from '@/components/services/WorkingHours';
import { servicesServerService } from '@/lib/services/services.server';

import { generateServiceMetadata } from './metadata';

// Lazy load modal to reduce initial bundle size
const BookVisitModal = dynamic(
  () =>
    import('@/components/visits/BookVisitModal').then((mod) => ({ default: mod.BookVisitModal })),
  {
    loading: () => <div className="h-10 w-32 animate-pulse rounded-lg bg-neutral-200" />,
    ssr: false,
  }
);

interface ServiceDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  const { locale, id } = await params;

  try {
    const service = await servicesServerService.getById(id, locale);
    if (!service) {
      return {
        title: 'Service Not Found - Auto Service Connect',
      };
    }
    return generateServiceMetadata(service, locale);
  } catch {
    return {
      title: 'Service Not Found - Auto Service Connect',
    };
  }
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { locale, id } = await params;
  const t = await getTranslations('services');
  const tNav = await getTranslations('navigation');

  // Validate locale
  const validLocales = ['hy', 'en', 'ru'];
  if (!validLocales.includes(locale)) {
    notFound();
  }

  // Fetch service data server-side for SEO
  const service = await servicesServerService.getById(id, locale);

  if (!service) {
    notFound();
  }

  // If service is blocked, show 404 (owner can see it in dashboard)
  // Note: Backend should filter blocked services, but we add extra check here
  if (service.isBlocked) {
    notFound();
  }

  const name = service.companyName || `${service.firstName} ${service.lastName}`;
  const rating = service.averageRating || 0;
  const reviewsCount = service.totalReviews || 0;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 pt-4 sm:pt-6">
        <ServiceBreadcrumbs serviceName={name} />
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-primary pb-8 pt-4 text-white sm:pb-10 sm:pt-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center">
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-32 sm:rounded-2xl">
              {service.avatarFile?.fileUrl ? (
                <Image
                  src={service.avatarFile.fileUrl}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="128px"
                  priority
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-white/20">
                  <span className="text-4xl font-bold">{name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              {service.isVerified && (
                <div className="absolute right-2 top-2 rounded-full bg-success-500 p-1">
                  <svg
                    className="h-4 w-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold sm:text-3xl">{name}</h1>
                {service.isVerified && (
                  <span className="rounded-full bg-success-500 px-2 py-1 text-xs font-medium">
                    {t('verified')}
                  </span>
                )}
              </div>

              {service.specialization && (
                <p className="mb-3 text-sm text-white/90 sm:mb-4 sm:text-base">
                  {service.specialization}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {rating > 0 && (
                  <div className="flex items-center gap-2 rounded-lg bg-white/10 px-2 py-1.5 sm:px-3">
                    <svg
                      className="h-4 w-4 fill-warning-300 text-warning-300 sm:h-5 sm:w-5"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-semibold sm:text-base">
                      {Number(rating).toFixed(1)}
                    </span>
                    <span className="text-xs text-white/90 sm:text-sm">
                      ({reviewsCount} {t('reviews')})
                    </span>
                  </div>
                )}

                {service.phoneNumber && (
                  <a
                    href={`tel:${service.phoneNumber.replace(/\s/g, '')}`}
                    className="flex items-center gap-1.5 rounded-lg bg-white/20 px-2 py-1.5 text-sm font-medium transition-all hover:bg-white/30 hover:shadow-lg sm:gap-2 sm:px-3 sm:text-base"
                  >
                    <svg
                      className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span className="whitespace-nowrap">{service.phoneNumber}</span>
                  </a>
                )}

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${service.address}, ${service.city}, ${service.region}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg bg-white/20 px-2 py-1.5 text-sm font-medium transition-all hover:bg-white/30 hover:shadow-lg sm:gap-2 sm:px-3 sm:text-base"
                >
                  <svg
                    className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="line-clamp-1 max-w-[200px] sm:max-w-none">
                    {service.address}, {service.city}
                  </span>
                </a>
              </div>
            </div>

            <div className="hidden lg:block">
              <ProtectedRoute redirect={false}>
                <BookVisitModal serviceId={id} serviceName={name} />
              </ProtectedRoute>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto -mt-6 px-4 pb-8 sm:-mt-8 sm:pb-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2 lg:space-y-8">
            {/* Description */}
            {service.description && (
              <div className="glass-light rounded-2xl p-8">
                <h2 className="mb-4 font-display text-2xl font-semibold">{t('description')}</h2>
                <p className="leading-relaxed text-neutral-700">{service.description}</p>
              </div>
            )}

            {/* Gallery */}
            {(service.profilePhotoFileIds?.length || service.workPhotoFileIds?.length) && (
              <div className="glass-light rounded-xl p-4 md:rounded-2xl md:p-8">
                <ServiceGallery
                  profilePhotos={service.profilePhotoFileIds}
                  workPhotos={service.workPhotoFileIds}
                />
              </div>
            )}

            {/* Services Offered */}
            {service.services && service.services.length > 0 && (
              <div className="glass-light rounded-xl p-4 md:rounded-2xl md:p-8">
                <ServiceTypesList services={service.services} />
              </div>
            )}

            {/* Map */}
            {service.latitude && service.longitude && (
              <div className="glass-light rounded-xl p-4 md:rounded-2xl md:p-8">
                <ServiceMap
                  latitude={service.latitude}
                  longitude={service.longitude}
                  address={service.address}
                  city={service.city}
                  name={name}
                />
              </div>
            )}

            {/* Reviews Section - Client component for interactivity */}
            <div className="glass-light rounded-xl p-4 md:rounded-2xl md:p-8">
              <ServiceDetailClient serviceId={id} profileId={id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6 lg:col-span-1 lg:space-y-8">
            {/* Contact Info */}
            <div className="glass-light rounded-xl p-4 sm:p-6 md:rounded-2xl md:p-8">
              <ServiceInfo
                phoneNumber={service.phoneNumber}
                address={service.address}
                city={service.city}
                region={service.region}
                yearsOfExperience={service.yearsOfExperience}
                serviceType={service.serviceType}
              />
            </div>

            {/* Working Hours */}
            {service.workingHours && Object.keys(service.workingHours).length > 0 && (
              <div className="glass-light rounded-xl p-4 sm:p-6 md:rounded-2xl md:p-8">
                <WorkingHours workingHours={service.workingHours} />
              </div>
            )}

            {/* Book Visit Button (for mobile) */}
            <div className="lg:hidden">
              <ProtectedRoute redirect={false}>
                <div className="glass-light rounded-xl p-4 md:rounded-2xl">
                  <BookVisitModal serviceId={id} serviceName={name} />
                </div>
              </ProtectedRoute>
            </div>
          </div>
        </div>
      </div>

      {/* SEO: Structured Data */}
      <ServiceSchema service={service} />
      <BreadcrumbSchema
        items={[
          { name: tNav('home'), url: `/${locale}` },
          { name: t('title'), url: `/${locale}/services` },
          { name, url: `/${locale}/services/${id}` },
        ]}
      />
    </div>
  );
}
