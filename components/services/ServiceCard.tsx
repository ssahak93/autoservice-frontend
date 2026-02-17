'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, MapPin, Star, Verified, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/routing';
import { getAvatarUrl } from '@/lib/utils/file';
import { formatServiceName } from '@/lib/utils/user';
import { isCurrentlyOpen, type WorkingHours as WorkingHoursUtil } from '@/lib/utils/workingHours';
import type { Provider } from '@/types';

interface ServiceCardProps {
  service: Provider;
  index?: number;
  distance?: number; // Distance in km
}

/**
 * ServiceCard Component
 *
 * Single Responsibility: Displays service information in a card format
 * Open/Closed: Can be extended with new features without modifying core
 */
export function ServiceCard({ service, index = 0, distance }: ServiceCardProps) {
  const t = useTranslations('services');
  // Safely construct name, handling undefined/null values
  const name = formatServiceName(
    service.companyName,
    service.firstName,
    service.lastName,
    t('unknownService', { defaultValue: 'Unknown Service' })
  );
  const rating = service.averageRating || 0;
  const reviewsCount = service.totalReviews || 0;
  const isOpen = service.workingHours
    ? isCurrentlyOpen(service.workingHours as WorkingHoursUtil)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="glass-light overflow-hidden rounded-xl transition-shadow hover:shadow-xl"
    >
      <Link href={`/services/${service.id}`} aria-label={`View details for ${name}`}>
        <div className="relative h-48 w-full overflow-hidden">
          {(() => {
            const avatarUrl = getAvatarUrl(service);
            return avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-400 to-secondary-400">
                <span className="text-4xl font-bold text-white" aria-hidden="true">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
            );
          })()}
          {service.isApproved && (
            <div
              className="absolute right-2 top-2 rounded-full bg-success-500 p-1"
              aria-label={t('approvedService', { defaultValue: 'Approved service' })}
            >
              <Verified className="h-4 w-4 text-white" />
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="mb-2 font-display text-lg font-semibold text-neutral-900">{name}</h3>

          {service.description && (
            <p className="mb-3 line-clamp-2 text-sm text-neutral-600">{service.description}</p>
          )}

          <div className="mb-3 space-y-2">
            {/* Location and Distance */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {service.community && service.region
                    ? `${service.community}, ${service.region}`
                    : service.community || service.region || ''}
                </span>
              </div>
              {distance !== undefined && (
                <div className="flex items-center gap-1 text-primary-600">
                  <span className="font-medium">{distance.toFixed(1)} km</span>
                </div>
              )}
            </div>

            {/* Rating and Status */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warning-400 text-warning-400" aria-hidden="true" />
                  <span
                    className="font-medium text-neutral-900"
                    aria-label={`Rating: ${rating} out of 5`}
                  >
                    {rating.toFixed(1)}
                  </span>
                  <span className="text-neutral-500" aria-label={`${reviewsCount} reviews`}>
                    ({reviewsCount})
                  </span>
                </div>
              )}
              {isOpen !== null && (
                <div
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    isOpen ? 'bg-success-50 text-success-700' : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {isOpen ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                      <span>{t('openNow', { defaultValue: 'Open' })}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" aria-hidden="true" />
                      <span>{t('closedNow', { defaultValue: 'Closed' })}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            {service.specialization && (
              <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                {service.specialization}
              </span>
            )}
            <span className="text-sm font-medium text-primary-600">View Details →</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
