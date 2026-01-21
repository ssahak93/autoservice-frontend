'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Info, FileText, Calendar, Image, CheckCircle2, Globe } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AutoServiceSelector } from '@/components/dashboard/AutoServiceSelector';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useAutoServiceProfile } from '@/hooks/useAutoServiceProfile';
import { useRouter } from '@/i18n/routing';
import { getAnimationVariants } from '@/lib/utils/animations';
import { useAutoServiceStore } from '@/stores/autoServiceStore';

import { ApprovalStatusBanner } from './ApprovalStatusBanner';
import { AutoServicesList } from './AutoServicesList';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { BlockedServiceBanner } from './BlockedServiceBanner';
import { CreateAutoService } from './CreateAutoService';
import { CreateProfileEditor } from './CreateProfileEditor';
import { IncompleteProfileBanner } from './IncompleteProfileBanner';
import { PhotoGallery } from './PhotoGallery';
import { ProfileEditor } from './ProfileEditor';
import { ServiceCardSkeleton } from './ServiceCardSkeleton';
import { ServiceInfoEditor } from './ServiceInfoEditor';

/**
 * Component for managing existing auto service profile
 * Only rendered when user owns at least one auto service
 */
function AutoServiceProfileManager() {
  // ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL LOGIC
  const t = useTranslations('myService');
  const tCommon = useTranslations('common');
  const { selectedAutoServiceId } = useAutoServiceStore();
  const [activeTab, setActiveTab] = useState<'info' | 'profile' | 'availability' | 'photos'>(
    'info'
  );

  // Use custom hook for profile management (SOLID - Single Responsibility)
  const { profile, isLoading, isProfileNotFound, validSelectedAutoServiceId, publishMutation } =
    useAutoServiceProfile(selectedAutoServiceId);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="glass-light h-32 animate-pulse rounded-xl" />
          {/* Tabs skeleton */}
          <div className="glass-light h-16 animate-pulse rounded-xl" />
          {/* Content skeleton - using ServiceCardSkeleton for consistency */}
          <ServiceCardSkeleton count={2} />
        </div>
      </motion.div>
    );
  }

  // Show create profile form if profile doesn't exist
  if (isProfileNotFound) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6 rounded-xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6 shadow-lg dark:border-amber-800 dark:from-amber-900/20 dark:to-orange-900/20"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {t('noProfile.title', { defaultValue: 'Profile Not Created Yet' })}
                </h3>
                <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
                  {t('noProfile.description', {
                    defaultValue:
                      'You have created an auto service, but the profile is not yet set up. Complete your profile to start accepting bookings from customers.',
                  })}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('noProfile.hint', {
                    defaultValue:
                      'Please fill out the form below to complete your auto service profile.',
                  })}
                </p>
              </div>
            </div>
          </motion.div>
          {/* Show form to create profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-light rounded-xl p-6"
          >
            <CreateProfileEditor />
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // At this point, profile is guaranteed to exist (non-null) after the early return above
  // TypeScript doesn't know this, so we use a non-null assertion
  // But we still need to check for profileCompleteness in case it's missing
  if (!profile) {
    // Fallback: should not happen due to early return, but handle gracefully
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="text-center text-gray-600 dark:text-gray-400">
          {tCommon('loading', { defaultValue: 'Loading...' })}
        </div>
      </motion.div>
    );
  }

  // Create valid profile object with defaults (only when profile exists)
  // Type assertion needed because TypeScript doesn't know profile structure fully
  const validProfile = profile
    ? ({
        ...profile,
        // Ensure profileCompleteness exists, default to 0 if missing
        profileCompleteness: profile.profileCompleteness ?? 0,
      } as typeof profile & { profileCompleteness: number })
    : null;

  const variants = getAnimationVariants();

  const tabs = [
    { id: 'info' as const, label: t('tabs.info', { defaultValue: 'Service Info' }), icon: Info },
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
    { id: 'photos' as const, label: t('tabs.photos', { defaultValue: 'Photos' }), icon: Image },
  ];

  return (
    <motion.div
      variants={variants.fadeIn}
      initial="initial"
      animate="animate"
      className="container mx-auto px-4 py-8"
    >
      {/* Auto Service Selector - show if user has multiple services */}
      <motion.div
        variants={variants.slideUp}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <AutoServiceSelector />
      </motion.div>

      {/* Show blocked service banner - check if auto service is blocked */}
      {/* Always render to maintain consistent hook count */}
      <motion.div
        variants={variants.slideUp}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.1 }}
        suppressHydrationWarning
      >
        <BlockedServiceBanner
          autoServiceId={validSelectedAutoServiceId || ''}
          blockedReason={
            (profile?.autoService as { blockedReason?: string | null })?.blockedReason || null
          }
        />
      </motion.div>

      {/* Show approval status banner - only if profile exists */}
      {validProfile && (
        <motion.div
          variants={variants.slideUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.15 }}
          suppressHydrationWarning
        >
          <ApprovalStatusBanner profile={validProfile} />
        </motion.div>
      )}

      {/* Show incomplete profile banner - only if profile exists */}
      {validProfile && (
        <motion.div
          variants={variants.slideUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
          suppressHydrationWarning
        >
          <IncompleteProfileBanner completeness={validProfile.profileCompleteness} />
        </motion.div>
      )}

      {/* Header Section with Stats - only show if profile exists */}
      {validProfile && (
        <motion.div
          variants={variants.slideUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <div className="glass-light rounded-xl p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('title', { defaultValue: 'My Service Profile' })}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {t('description', {
                    defaultValue: 'Manage your auto service profile and settings',
                  })}
                </p>
              </div>

              {/* Stats Cards */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Completeness Card */}
                <div className="glass-light rounded-lg border border-primary-200 bg-gradient-to-br from-primary-50 to-primary-100/50 p-4 dark:border-primary-800 dark:from-primary-900/20 dark:to-primary-800/10">
                  <div className="text-center">
                    <p className="text-xs font-medium text-primary-700 dark:text-primary-300">
                      {t('completeness', { defaultValue: 'Profile Completeness' })}
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-2">
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

                {/* Publish Status Button */}
                <div className="flex items-center">
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
                        {t('publish', { defaultValue: 'Publish Profile' })}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs - only show if profile exists */}
      {validProfile && (
        <>
          <motion.div
            variants={variants.slideUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div className="glass-light rounded-xl border-b-0 p-0">
              <nav className="flex space-x-1 overflow-x-auto px-4" aria-label="Profile tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group relative flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-all ${
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
                      <span>{tab.label}</span>
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

          {/* Tab Content with Animation */}
          <motion.div
            variants={variants.slideUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.35 }}
            className="glass-light rounded-xl p-6"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'info' && <ServiceInfoEditor profile={validProfile} />}
                {activeTab === 'profile' && <ProfileEditor profile={validProfile} />}
                {activeTab === 'availability' && <AvailabilityCalendar profile={validProfile} />}
                {activeTab === 'photos' && <PhotoGallery profile={validProfile} />}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

/**
 * Main component that decides whether to show create form or profile manager
 */
export function AutoServiceProfileContent() {
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const t = useTranslations('myService');
  const { user, isLoading: isLoadingUser } = useAuth();
  const { selectedAutoServiceId, setSelectedAutoServiceId, availableAutoServices } =
    useAutoServiceStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const showCreateForm = searchParams?.get('create') === 'true';

  // Check if user owns any auto service
  // Also check availableAutoServices from store as fallback
  const hasServicesFromUser = !!user && user.autoServices && user.autoServices.length > 0;
  const hasServicesFromStore = availableAutoServices.filter((s) => s.role === 'owner').length > 0;
  const isServiceOwner = hasServicesFromUser || hasServicesFromStore;

  // Clear invalid selectedAutoServiceId immediately when user has no services
  useEffect(() => {
    // Get user's owned service IDs inside useEffect to avoid dependency issues
    const userOwnedServiceIds = user?.autoServices?.map((s) => s.id) || [];

    if (!user) {
      // User not loaded - clear selectedAutoServiceId
      if (selectedAutoServiceId) {
        setSelectedAutoServiceId(null);
      }
      return;
    }

    if (!isServiceOwner) {
      // User has no services - clear selectedAutoServiceId
      if (selectedAutoServiceId) {
        setSelectedAutoServiceId(null);
      }
      return;
    }

    // Validate selectedAutoServiceId belongs to user
    if (selectedAutoServiceId && !userOwnedServiceIds.includes(selectedAutoServiceId)) {
      setSelectedAutoServiceId(null);
    }
  }, [user, isServiceOwner, selectedAutoServiceId, setSelectedAutoServiceId]);

  // NOW we can do conditional returns - all hooks have been called
  // Wait for user to load
  if (isLoadingUser) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // If user has no services, show create form
  if (!isServiceOwner) {
    return (
      <ProtectedRoute>
        <CreateAutoService />
      </ProtectedRoute>
    );
  }

  // User has services - show services list and profile manager
  // Always show services list to help users manage all their services
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Show create form if create=true in query params */}
          {showCreateForm ? (
            <div className="mb-8">
              <div className="mb-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/my-service')}
                  className="flex items-center gap-2"
                >
                  ← {t('servicesList.backToList', { defaultValue: 'Back to Services List' })}
                </Button>
              </div>
              <CreateAutoService />
            </div>
          ) : (
            <>
              {/* Show list of all services with completion status */}
              <div className="mb-8">
                <AutoServicesList />
              </div>

              {/* Show profile manager for selected service */}
              <AutoServiceProfileManager />
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
