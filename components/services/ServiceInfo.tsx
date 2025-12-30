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
    <div className="mb-8">
      <h2 className="mb-4 font-display text-2xl font-semibold">{t('contactInfo')}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {phoneNumber && (
          <a
            href={`tel:${phoneNumber}`}
            className="flex items-center gap-3 rounded-lg border-2 border-neutral-200 p-4 transition-colors hover:border-primary-500 hover:bg-primary-50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">{t('phone')}</p>
              <p className="font-semibold text-neutral-900">{phoneNumber}</p>
            </div>
          </a>
        )}

        <div className="flex items-center gap-3 rounded-lg border-2 border-neutral-200 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-600">{t('address')}</p>
            <p className="font-semibold text-neutral-900">
              {address}, {city}, {region}
            </p>
          </div>
        </div>

        {yearsOfExperience && (
          <div className="flex items-center gap-3 rounded-lg border-2 border-neutral-200 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">{t('experience')}</p>
              <p className="font-semibold text-neutral-900">
                {yearsOfExperience} {t('years')}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 rounded-lg border-2 border-neutral-200 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-600">{t('serviceType')}</p>
            <p className="font-semibold capitalize text-neutral-900">
              {serviceType === 'company' ? t('company') : t('individual')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
