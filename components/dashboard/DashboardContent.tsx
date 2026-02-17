'use client';

import { motion } from 'framer-motion';
import { Car } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { CreateServiceBanner } from '@/components/provider/CreateServiceBanner';
import { getAnimationVariants, getTransition } from '@/lib/utils/animations';
import { getAvatarUrl } from '@/lib/utils/file';
import { useProviderStore } from '@/stores/providerStore';

import { DashboardStats } from './DashboardStats';
import { RecentVisits } from './RecentVisits';

export function DashboardContent() {
  const t = useTranslations('dashboard');
  const variants = getAnimationVariants();
  const transition = getTransition(0.3);
  const { getSelectedProvider } = useProviderStore();

  // Get provider name and avatar
  const selectedProvider = getSelectedProvider();

  const getProviderName = () => {
    if (!selectedProvider) return null;
    if (selectedProvider.serviceType === 'company' && selectedProvider.companyName) {
      return selectedProvider.companyName;
    }
    if (selectedProvider.firstName || selectedProvider.lastName) {
      return `${selectedProvider.firstName || ''} ${selectedProvider.lastName || ''}`.trim();
    }
    return selectedProvider.name || null;
  };

  const providerName = getProviderName();
  const providerAvatar = selectedProvider ? getAvatarUrl(selectedProvider) : null;

  return (
    <motion.div
      variants={variants.fadeIn}
      initial="initial"
      animate="animate"
      transition={transition}
      className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:py-8"
    >
      {/* Create Service Banner */}
      <motion.div
        variants={variants.slideUp}
        initial="initial"
        animate="animate"
        transition={{ ...transition, delay: 0.05 }}
        className="mb-6"
      >
        <div suppressHydrationWarning>
          <CreateServiceBanner />
        </div>
      </motion.div>

      <motion.div
        variants={variants.slideUp}
        initial="initial"
        animate="animate"
        transition={{ ...transition, delay: 0.1 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex items-center gap-4">
          {/* Provider Avatar */}
          {providerAvatar ? (
            <Image
              src={providerAvatar}
              alt={providerName || 'Provider'}
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              <Car className="h-7 w-7" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
              {t('title', { defaultValue: 'Dashboard' })}
            </h1>
            {providerName && (
              <p className="mt-1 text-lg font-semibold text-primary-600 dark:text-primary-400">
                {providerName}
              </p>
            )}
            <p className="mt-2 text-sm text-gray-600 sm:text-base dark:text-gray-400">
              {t('subtitle', { defaultValue: 'Overview of your provider' })}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={variants.slideUp}
        initial="initial"
        animate="animate"
        transition={{ ...transition, delay: 0.2 }}
      >
        <DashboardStats />
      </motion.div>

      <motion.div
        variants={variants.slideUp}
        initial="initial"
        animate="animate"
        transition={{ ...transition, delay: 0.3 }}
        className="mt-6 sm:mt-8"
      >
        <RecentVisits />
      </motion.div>
    </motion.div>
  );
}
