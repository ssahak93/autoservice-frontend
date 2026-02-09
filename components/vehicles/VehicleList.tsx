'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/Button';
import { useVehicles } from '@/hooks/useVehicles';
import { getAnimationVariants } from '@/lib/utils/animations';

import { AddVehicleModal } from './AddVehicleModal';
import { VehicleCard } from './VehicleCard';

interface VehicleListProps {
  onVehicleSelect?: (vehicleId: string) => void;
}

export function VehicleList({ onVehicleSelect: _onVehicleSelect }: VehicleListProps) {
  const t = useTranslations('vehicles');
  const { data: vehicles, isLoading, refetch } = useVehicles();
  const [showAddModal, setShowAddModal] = useState(false);
  const variants = getAnimationVariants();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    );
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <>
        <EmptyState
          icon={Plus}
          title={t('noVehicles', { defaultValue: 'No vehicles yet' })}
          description={t('noVehiclesDescription', {
            defaultValue:
              'Add your first vehicle to track service history and make booking easier.',
          })}
          action={{
            label: t('addVehicle', { defaultValue: 'Add Vehicle' }),
            onClick: () => setShowAddModal(true),
            variant: 'primary',
          }}
        />
        <AddVehicleModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            refetch();
            setShowAddModal(false);
          }}
        />
      </>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">
            {t('myVehicles', { defaultValue: 'My Vehicles' })}
          </h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {t('vehiclesCount', {
              defaultValue: '{count} vehicle(s)',
              count: vehicles.length,
            })}
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('addVehicle', { defaultValue: 'Add Vehicle' })}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle, index) => (
          <motion.div
            key={vehicle.id}
            initial={variants.fadeIn.initial}
            animate={variants.fadeIn.animate}
            transition={{ delay: index * 0.1 }}
          >
            <VehicleCard vehicle={vehicle} onEdit={() => refetch()} onDelete={() => refetch()} />
          </motion.div>
        ))}
      </div>

      <AddVehicleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          refetch();
          setShowAddModal(false);
        }}
      />
    </>
  );
}
