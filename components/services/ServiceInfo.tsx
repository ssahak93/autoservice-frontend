'use client';

import { Award, Calendar, Phone, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ServiceInfoProps {
  phoneNumber?: string;
  address: string;
  city: string;
  region: string;
  yearsOfExperience?: number;
  serviceType: 'individual' | 'company';
}

/**
 * ServiceInfo Component
 *
 * Single Responsibility: Displays contact information and service details
 * Responsive Design: Mobile-first approach with clean, readable layout
 */
export function ServiceInfo({
  phoneNumber,
  address,
  city,
  region,
  yearsOfExperience,
  serviceType,
}: ServiceInfoProps) {
  const t = useTranslations('services');

  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-semibold text-neutral-900 sm:text-2xl">
        {t('contactInfo')}
      </h2>

      <div className="space-y-3 sm:space-y-4">
        {/* Phone Number */}
        {phoneNumber && (
          <a
            href={`tel:${phoneNumber.replace(/\s/g, '')}`}
            className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-primary-400 hover:bg-primary-50 hover:shadow-md sm:p-5"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 transition-colors group-hover:bg-primary-200 sm:h-14 sm:w-14">
              <Phone className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500 sm:text-sm">
                {t('phone')}
              </p>
              <p className="text-base font-semibold text-neutral-900 sm:text-lg">{phoneNumber}</p>
            </div>
          </a>
        )}

        {/* Address */}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${city}, ${region}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-primary-400 hover:bg-primary-50 hover:shadow-md sm:p-5"
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 transition-colors group-hover:bg-primary-200 sm:h-14 sm:w-14">
            <MapPin className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500 sm:text-sm">
              {t('address')}
            </p>
            <p className="text-base font-semibold leading-relaxed text-neutral-900 sm:text-lg">
              {address}
              <br />
              <span className="text-sm text-neutral-600 sm:text-base">
                {city}, {region}
              </span>
            </p>
          </div>
        </a>

        {/* Experience and Service Type - One row each on small devices, side by side on larger screens */}
        <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-4">
          {yearsOfExperience && (
            <div className="flex w-full items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-sm sm:p-5">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 sm:h-14 sm:w-14">
                <Award className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500 sm:text-sm">
                  {t('experience')}
                </p>
                <p className="text-base font-semibold text-neutral-900 sm:text-lg">
                  {yearsOfExperience} {t('years')}
                </p>
              </div>
            </div>
          )}

          <div className="flex w-full items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-sm sm:p-5">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 sm:h-14 sm:w-14">
              <Calendar className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500 sm:text-sm">
                {t('serviceType')}
              </p>
              <p className="text-base font-semibold capitalize text-neutral-900 sm:text-lg">
                {serviceType === 'company' ? t('company') : t('individual')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
