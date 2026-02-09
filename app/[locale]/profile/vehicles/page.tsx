'use client';

import { motion } from 'framer-motion';
import { Car } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { VehicleList } from '@/components/vehicles/VehicleList';
import { getAnimationVariants } from '@/lib/utils/animations';

export default function VehiclesPage() {
  const t = useTranslations('vehicles');
  const variants = getAnimationVariants();

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <motion.div
          variants={variants.slideUp}
          initial="initial"
          animate="animate"
          className="mb-6 sm:mb-8"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-primary-400 to-secondary-400 p-3">
              <Car className="h-6 w-6 text-white sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl">
                {t('myVehicles', { defaultValue: 'My Vehicles' })}
              </h1>
              <p className="mt-2 text-sm text-neutral-600 sm:text-base">
                {t('myVehiclesDescription', {
                  defaultValue: 'Manage your vehicles and track service history',
                })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Vehicle List */}
        <motion.div
          variants={variants.slideUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
        >
          <VehicleList />
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
