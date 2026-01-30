'use client';

import { MapPin, Phone, Star, CheckCircle2, XCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { AutoServiceProfile } from '@/lib/services/auto-service-profile.service';

interface ServiceInfoProps {
  profile: AutoServiceProfile;
}

export function ServiceInfo({ profile }: ServiceInfoProps) {
  const t = useTranslations('myService.info');
  const tCreate = useTranslations('myService.create');

  const serviceName =
    profile.autoService?.serviceType === 'company'
      ? profile.autoService.companyName
      : `${profile.autoService?.firstName || ''} ${profile.autoService?.lastName || ''}`.trim();

  // Helper to get service type translation
  const getServiceTypeLabel = (serviceType?: 'individual' | 'company') => {
    if (!serviceType) return '-';
    return serviceType === 'company'
      ? tCreate('company', { defaultValue: 'Company' })
      : tCreate('individual', { defaultValue: 'Individual' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          {t('title', { defaultValue: 'Service Information' })}
        </h2>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('serviceName', { defaultValue: 'Service Name' })}
            </label>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
              {serviceName || '-'}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('serviceType', { defaultValue: 'Service Type' })}
            </label>
            <p className="mt-1 text-gray-900 dark:text-white">
              {getServiceTypeLabel(profile.autoService?.serviceType)}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('approvalStatus', { defaultValue: 'Approval Status' })}
            </label>
            <div className="mt-1 flex items-center gap-2">
              {profile.autoService?.isApproved ? (
                <>
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">
                    {t('approved', { defaultValue: 'Approved' })}
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <span className="text-amber-600 dark:text-amber-400">
                    {t('pendingApproval', { defaultValue: 'Pending Approval' })}
                  </span>
                </>
              )}
            </div>
            {!profile.autoService?.isApproved && profile.autoService?.rejectionReason && (
              <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  {t('rejectionReason', { defaultValue: 'Rejection Reason' })}:
                </p>
                <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                  {profile.autoService.rejectionReason}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('verificationStatus', { defaultValue: 'Verification Status' })}
            </label>
            <div className="mt-1 flex items-center gap-2">
              {profile.autoService?.isApproved ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">
                    {t('approved', { defaultValue: 'Approved' })}
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('pending', { defaultValue: 'Pending Approval' })}
                  </span>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('publishStatus', { defaultValue: 'Publish Status' })}
            </label>
            <div className="mt-1 flex items-center gap-2">
              {profile.isPublished ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">
                    {t('published', { defaultValue: 'Published' })}
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-yellow-500" />
                  <span className="text-yellow-600 dark:text-yellow-400">
                    {t('unpublished', { defaultValue: 'Unpublished' })}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('rating', { defaultValue: 'Rating' })}
            </label>
            <div className="mt-1 flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {profile.averageRating ? Number(profile.averageRating).toFixed(1) : '0.0'}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ({profile.totalReviews} {t('reviews', { defaultValue: 'reviews' })})
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('totalVisits', { defaultValue: 'Max Visits Per Day' })}
            </label>
            <p className="mt-1 text-gray-900 dark:text-white">{profile.maxVisitsPerDay}</p>
          </div>

          {profile.yearsOfExperience && (
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('experience', { defaultValue: 'Years of Experience' })}
              </label>
              <p className="mt-1 text-gray-900 dark:text-white">
                {profile.yearsOfExperience} {t('years', { defaultValue: 'years' })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contact & Location */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            {t('contactInfo', { defaultValue: 'Contact Information' })}
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('phone', { defaultValue: 'Phone' })}
                </label>
                <p className="text-gray-900 dark:text-white">{profile.phoneNumber}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            {t('location', { defaultValue: 'Location' })}
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <p className="text-gray-900 dark:text-white">{profile.address}</p>
                {(profile.community || profile.region) && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {profile.community && profile.region
                      ? `${profile.community}, ${profile.region}`
                      : profile.community || profile.region}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  {t('coordinates', { defaultValue: 'Coordinates' })}:{' '}
                  {Number(profile.latitude).toFixed(6)}, {Number(profile.longitude).toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {profile.description && (
        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            {t('description', { defaultValue: 'Description' })}
          </h3>
          <p className="rounded-lg bg-gray-50 p-4 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {profile.description}
          </p>
        </div>
      )}

      {/* Specialization */}
      {profile.specialization && (
        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            {t('specialization', { defaultValue: 'Specialization' })}
          </h3>
          <p className="rounded-lg bg-gray-50 p-4 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {profile.specialization}
          </p>
        </div>
      )}

      {/* Services Offered */}
      {profile.services && profile.services.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            {t('servicesOffered', { defaultValue: 'Services Offered' })}
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.services.map((service) => (
              <span
                key={service.id}
                className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
              >
                {service.serviceType.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
