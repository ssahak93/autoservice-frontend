'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { CreateServiceBanner } from '@/components/auto-service/CreateServiceBanner';
import { getAnimationVariants, getTransition } from '@/lib/utils/animations';

import { DashboardStats } from './DashboardStats';
import { RecentVisits } from './RecentVisits';

export function DashboardContent() {
  const t = useTranslations('dashboard');
  const variants = getAnimationVariants();
  const transition = getTransition(0.3);

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
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
          {t('title', { defaultValue: 'Dashboard' })}
        </h1>
        <p className="mt-2 text-sm text-gray-600 sm:text-base dark:text-gray-400">
          {t('subtitle', { defaultValue: 'Overview of your auto service' })}
        </p>
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
