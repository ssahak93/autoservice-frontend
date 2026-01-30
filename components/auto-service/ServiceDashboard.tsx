'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  FileText,
  Calendar,
  Image as ImageIcon,
  Globe,
  CheckCircle2,
  TrendingUp,
  Building2,
  User,
  AlertCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { useAutoServiceProfile } from '@/hooks/useAutoServiceProfile';
import { getAnimationVariants } from '@/lib/utils/animations';

import { ApprovalStatusBanner } from './ApprovalStatusBanner';
import { AutoServiceEditor } from './AutoServiceEditor';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { BlockedServiceBanner } from './BlockedServiceBanner';
import { CreateProfileEditor } from './CreateProfileEditor';
import { IncompleteProfileBanner } from './IncompleteProfileBanner';
import { PhotoGallery } from './PhotoGallery';
import { ProfileEditor } from './ProfileEditor';

interface ServiceDashboardProps {
  autoServiceId: string;
}

/**
 * Dashboard for managing a single auto service
 * Interactive design with improved UX
 */
export function ServiceDashboard({ autoServiceId }: ServiceDashboardProps) {
  const t = useTranslations('myService');
  const [activeTab, setActiveTab] = useState<
    'overview' | 'info' | 'profile' | 'availability' | 'photos'
  >('overview');

  const { profile, isLoading, isProfileNotFound, publishMutation } =
    useAutoServiceProfile(autoServiceId);

  const variants = getAnimationVariants();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="glass-light h-48 animate-pulse rounded-2xl" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-light h-32 animate-pulse rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show create profile form if profile doesn't exist
  if (isProfileNotFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="container mx-auto px-4 py-8"
        >
          <div className="mx-auto max-w-5xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <div className="glass-light rounded-2xl p-8">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg">
                      <AlertCircle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                      {t('noProfile.title', { defaultValue: 'Complete Your Profile' })}
                    </h1>
                    <p className="mb-4 text-base text-gray-700 dark:text-gray-300">
                      {t('noProfile.description', {
                        defaultValue:
                          'Create your auto service profile to start accepting bookings from customers. Fill out the information below to get started.',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Create Profile Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-light rounded-2xl p-8"
            >
              <AutoServiceEditor autoServiceId={autoServiceId} />
              <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700">
                <CreateProfileEditor />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // At this point, profile is guaranteed to exist
  if (!profile) {
    return null;
  }

  const validProfile = {
    ...profile,
    profileCompleteness: profile.profileCompleteness ?? 0,
  } as typeof profile & { profileCompleteness: number };

  const autoService = profile.autoService as {
    id: string;
    companyName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    serviceType: string;
    avatarFile?: { fileUrl: string } | null;
    isBlocked?: boolean;
    blockedReason?: string | null;
  };

  const tabs = [
    {
      id: 'overview' as const,
      label: t('tabs.overview', { defaultValue: 'Overview' }),
      icon: TrendingUp,
    },
    {
      id: 'info' as const,
      label: t('tabs.info', { defaultValue: 'Service Info' }),
      icon: Settings,
    },
    {
      id: 'profile' as const,
      label: t('tabs.profile', { defaultValue: 'Profile' }),
      icon: FileText,
    },
    {
      id: 'availability' as const,
      label: t('tabs.availability', { defaultValue: 'Availability' }),
      icon: Calendar,
    },
    { id: 'photos' as const, label: t('tabs.photos', { defaultValue: 'Photos' }), icon: ImageIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Status Banners */}
        <motion.div
          variants={variants.slideUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
          className="mb-6 space-y-4"
        >
          <BlockedServiceBanner
            autoServiceId={autoServiceId}
            blockedReason={autoService.blockedReason || null}
          />
          <ApprovalStatusBanner profile={validProfile} />
          <IncompleteProfileBanner completeness={validProfile.profileCompleteness} />
        </motion.div>

        {/* Hero Header */}
        <motion.div
          variants={variants.slideUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <div className="glass-light rounded-2xl p-6 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              {/* Service Info */}
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {autoService.avatarFile ? (
                    <div className="relative h-24 w-24 overflow-hidden rounded-2xl shadow-xl ring-4 ring-white dark:ring-gray-800">
                      <Image
                        src={autoService.avatarFile.fileUrl}
                        alt={
                          autoService.companyName ||
                          `${autoService.firstName} ${autoService.lastName}`
                        }
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-xl">
                      {autoService.serviceType === 'company' ? (
                        <Building2 className="h-12 w-12 text-white" />
                      ) : (
                        <User className="h-12 w-12 text-white" />
                      )}
                    </div>
                  )}
                  {validProfile.isApproved && (
                    <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 shadow-lg ring-4 ring-white dark:ring-gray-800">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {autoService.companyName ||
                      `${autoService.firstName || ''} ${autoService.lastName || ''}`.trim() ||
                      t('title', { defaultValue: 'My Service Profile' })}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                      {autoService.serviceType === 'company' ? (
                        <Building2 className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                      <span className="capitalize">{autoService.serviceType}</span>
                    </span>
                    {validProfile.city && (
                      <span className="flex items-center gap-1.5">
                        <span>{validProfile.city.name}</span>
                        {validProfile.district && `, ${validProfile.district.name}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Completeness Indicator */}
                <div className="glass-light rounded-xl border border-primary-200 bg-gradient-to-br from-primary-50 to-primary-100/50 p-4 dark:border-primary-800 dark:from-primary-900/20 dark:to-primary-800/10">
                  <div className="text-center">
                    <p className="text-xs font-medium text-primary-700 dark:text-primary-300">
                      {t('completeness', { defaultValue: 'Completeness' })}
                    </p>
                    <div className="mt-2 flex items-center justify-center">
                      <div className="relative h-16 w-16">
                        <svg className="h-16 w-16 -rotate-90 transform">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            className="text-gray-200 dark:text-gray-700"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${(validProfile.profileCompleteness / 100) * 175.9} 175.9`}
                            className="text-primary-600 transition-all duration-500"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary-600">
                            {validProfile.profileCompleteness}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Publish Button */}
                <Button
                  variant={validProfile.isPublished ? 'outline' : 'primary'}
                  onClick={() => publishMutation.mutate(!validProfile.isPublished)}
                  isLoading={publishMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {validProfile.isPublished ? (
                    <>
                      <Globe className="h-4 w-4" />
                      {t('unpublish', { defaultValue: 'Unpublish' })}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      {t('publish', { defaultValue: 'Publish' })}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div
          variants={variants.slideUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="glass-light rounded-2xl border-b-0 p-0">
            <nav className="flex space-x-1 overflow-x-auto px-4" aria-label="Service tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition-all ${
                      isActive
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon
                      className={`h-5 w-5 transition-transform ${
                        isActive ? 'scale-110' : 'group-hover:scale-105'
                      }`}
                    />
                    <span className="whitespace-nowrap">{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          variants={variants.slideUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.25 }}
        >
          <div className="glass-light rounded-2xl p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {t('overview.title', { defaultValue: 'Service Overview' })}
                    </h2>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {/* Status Card */}
                      <div className="glass-light rounded-xl border border-gray-200 p-6 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30">
                            <CheckCircle2 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {t('overview.status', { defaultValue: 'Status' })}
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {validProfile.isApproved
                                ? t('overview.approved', { defaultValue: 'Approved' })
                                : t('overview.pending', { defaultValue: 'Pending' })}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Visibility Card */}
                      <div className="glass-light rounded-xl border border-gray-200 p-6 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                            <Globe className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {t('overview.visibility', { defaultValue: 'Visibility' })}
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {validProfile.isPublished
                                ? t('overview.published', { defaultValue: 'Published' })
                                : t('overview.private', { defaultValue: 'Private' })}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Completeness Card */}
                      <div className="glass-light rounded-xl border border-gray-200 p-6 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                            <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {t('overview.completeness', { defaultValue: 'Completeness' })}
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {validProfile.profileCompleteness}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'info' && <AutoServiceEditor autoServiceId={autoServiceId} />}
                {activeTab === 'profile' && <ProfileEditor profile={validProfile} />}
                {activeTab === 'availability' && <AvailabilityCalendar profile={validProfile} />}
                {activeTab === 'photos' && <PhotoGallery profile={validProfile} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
