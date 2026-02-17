import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { ServiceBreadcrumbs } from '@/components/common/ServiceBreadcrumbs';
import { ReviewList } from '@/components/reviews/ReviewList';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { ServiceSchema } from '@/components/seo/ServiceSchema';
import { ServiceDetailClient } from '@/components/services/ServiceDetailClient';
import { ServiceGallery } from '@/components/services/ServiceGallery';
import { ServiceInfo } from '@/components/services/ServiceInfo';
import { ServiceTypesList } from '@/components/services/ServiceTypesList';
import { WorkingHours } from '@/components/services/WorkingHours';
import { servicesServerService } from '@/lib/services/services.server';

import { generateServiceMetadata } from './metadata';

interface ServiceDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  const { locale, id } = await params;

  try {
    const provider = await servicesServerService.getById(id, locale);
    if (!provider) {
      return {
        title: 'Provider Not Found - Auto Service Connect',
      };
    }
    return generateServiceMetadata(provider, locale);
  } catch {
    return {
      title: 'Provider Not Found - Auto Service Connect',
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

  // Fetch provider data server-side for SEO
  const provider = await servicesServerService.getById(id, locale);

  if (!provider) {
    notFound();
  }

  // If provider is blocked, show 404 (owner can see it in dashboard)
  // Note: Backend should filter blocked providers, but we add extra check here
  if (provider.isBlocked) {
    notFound();
  }

  const name = provider.companyName || `${provider.firstName} ${provider.lastName}`;
  const rating = provider.averageRating || 0;
  const reviewsCount = provider.totalReviews || 0;

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
              {provider.avatarFile?.fileUrl ? (
                <Image
                  src={provider.avatarFile.fileUrl}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="128px"
                  priority
                  loading="eager"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-white/20">
                  <span className="text-4xl font-bold">{name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              {provider.isApproved && (
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
                {provider.isApproved && (
                  <span className="rounded-full bg-success-500 px-2 py-1 text-xs font-medium">
                    {t('approved')}
                  </span>
                )}
              </div>

              {provider.specialization && (
                <p className="mb-3 text-sm text-white/90 sm:mb-4 sm:text-base">
                  {provider.specialization}
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

                {provider.phoneNumber && (
                  <a
                    href={`tel:${provider.phoneNumber.replace(/\s/g, '')}`}
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
                    <span className="whitespace-nowrap">{provider.phoneNumber}</span>
                  </a>
                )}

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${provider.address}, ${provider.community || ''}, ${provider.region || ''}`)}`}
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
                    {provider.address}
                    {provider.community && `, ${provider.community}`}
                    {provider.region && `, ${provider.region}`}
                  </span>
                </a>
              </div>
            </div>

            <div className="hidden lg:block">
              <ServiceDetailClient
                serviceId={id}
                profileId={id}
                bookVisitModalProps={{ serviceId: id, serviceName: name }}
              />
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
            {provider.description && (
              <div className="glass-light rounded-2xl p-8">
                <h2 className="mb-4 font-display text-2xl font-semibold">{t('description')}</h2>
                <p className="leading-relaxed text-neutral-700">{provider.description}</p>
              </div>
            )}

            {/* Gallery */}
            {((provider.profilePhotoFileIds && provider.profilePhotoFileIds.length > 0) ||
              (provider.workPhotoFileIds && provider.workPhotoFileIds.length > 0)) && (
              <div className="glass-light rounded-xl p-4 md:rounded-2xl md:p-8">
                <ServiceGallery
                  profilePhotos={provider.profilePhotoFileIds}
                  workPhotos={provider.workPhotoFileIds}
                />
              </div>
            )}

            {/* Services Offered */}
            {provider.services && provider.services.length > 0 && (
              <div className="glass-light rounded-xl p-4 md:rounded-2xl md:p-8">
                <ServiceTypesList services={provider.services} />
              </div>
            )}

            {/* Map */}
            {provider.latitude && provider.longitude && (
              <div className="glass-light rounded-xl p-4 md:rounded-2xl md:p-8">
                <ServiceDetailClient
                  serviceId={id}
                  profileId={id}
                  serviceMapProps={{
                    latitude: provider.latitude,
                    longitude: provider.longitude,
                    address: provider.address,
                    city: provider.community || '',
                    name,
                  }}
                />
              </div>
            )}

            {/* Reviews Section */}
            <div className="glass-light rounded-xl p-4 md:rounded-2xl md:p-8">
              <ReviewList serviceId={id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6 lg:col-span-1 lg:space-y-8">
            {/* Contact Info */}
            <div className="glass-light rounded-xl p-4 sm:p-6 md:rounded-2xl md:p-8">
              <ServiceInfo
                phoneNumber={provider.phoneNumber}
                address={provider.address}
                city={provider.community || ''}
                region={provider.region || ''}
                yearsOfExperience={provider.yearsOfExperience}
                serviceType={provider.serviceType}
              />
            </div>

            {/* Working Hours */}
            {provider.workingHours && Object.keys(provider.workingHours).length > 0 && (
              <div className="glass-light rounded-xl p-4 sm:p-6 md:rounded-2xl md:p-8">
                <WorkingHours workingHours={provider.workingHours} />
              </div>
            )}

            {/* Book Visit Button (for mobile) */}
            <div className="lg:hidden">
              <div className="glass-light rounded-xl p-4 md:rounded-2xl">
                <ServiceDetailClient
                  serviceId={id}
                  profileId={id}
                  bookVisitModalProps={{ serviceId: id, serviceName: name }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEO: Structured Data */}
      <ServiceSchema service={provider} />
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
