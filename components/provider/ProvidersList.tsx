'use client';

import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';

import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAvailableProviders } from '@/hooks/useAvailableProviders';
import { useDeleteProvider } from '@/hooks/useProviderMutations';
import { useRouter } from '@/i18n/routing';
import type { ServiceType } from '@/lib/constants/service-type.constants';
import { SERVICE_TYPE } from '@/lib/constants/service-type.constants';
import { getAnimationVariants } from '@/lib/utils/animations';
import { useProviderStore } from '@/stores/providerStore';

import { SectionHeader, ServiceCard, ServiceCardSkeleton, ServicesSummary } from './';

/**
 * Component to display all user's providers with their completion status
 * Shows which providers have branches and which don't
 */
// Legacy export

export function ProvidersList() {
  const t = useTranslations('myService');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { selectedProviderId, setSelectedProviderId } = useProviderStore();
  const [mounted, setMounted] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    serviceId: string;
    hasBranch: boolean;
  }>({ isOpen: false, serviceId: '', hasBranch: false });
  const deleteConfirmRef = useRef(deleteConfirm);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep ref in sync with state
  useEffect(() => {
    deleteConfirmRef.current = deleteConfirm;
  }, [deleteConfirm]);

  const variants = getAnimationVariants();

  // Use custom hook for fetching available providers (SOLID - Single Responsibility)
  const { ownedProviders: ownedServices, isLoading: isLoadingServices } = useAvailableProviders();

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Memoize filtered services to prevent unnecessary recalculations
  const incompleteServices = useMemo(
    () => (Array.isArray(ownedServices) ? ownedServices.filter((s) => s && !s.hasBranch) : []),
    [ownedServices]
  );
  const completeServices = useMemo(
    () => (Array.isArray(ownedServices) ? ownedServices.filter((s) => s && s.hasBranch) : []),
    [ownedServices]
  );

  // Only show list if user has multiple services
  // Single service is handled by ServiceDashboard
  const shouldShow = useMemo(() => ownedServices.length > 1, [ownedServices.length]);

  // Memoize callbacks to prevent unnecessary re-renders of child components
  const handleSelectService = useCallback(
    (serviceId: string) => {
      setSelectedProviderId(serviceId);
      router.push('/my-service');
    },
    [router, setSelectedProviderId]
  );

  const handleDelete = useCallback((serviceId: string, hasBranch: boolean) => {
    setDeleteConfirm({ isOpen: true, serviceId, hasBranch });
  }, []);

  // Use custom hook for delete mutation (SOLID - Single Responsibility)
  const deleteMutation = useDeleteProvider();

  const confirmDelete = useCallback(() => {
    const current = deleteConfirmRef.current;
    if (!current.serviceId) return;
    setDeletingServiceId(current.serviceId);
    deleteMutation.mutate(current.serviceId);
    setDeleteConfirm({ isOpen: false, serviceId: '', hasBranch: false });
  }, [deleteMutation]);

  // Memoize helper function to prevent unnecessary re-renders
  const getServiceTypeLabel = useCallback(
    (serviceType: ServiceType) => {
      return serviceType === SERVICE_TYPE.COMPANY
        ? t('create.company', { defaultValue: 'Company' })
        : t('create.individual', { defaultValue: 'Individual' });
    },
    [t]
  );

  // NOW we can do conditional returns - all hooks have been called
  if (!mounted || isLoadingServices) {
    return <ServiceCardSkeleton count={3} />;
  }

  // Don't show if no services or only one service
  // Single service is handled by ServiceDashboard
  if (ownedServices.length === 0 || !shouldShow) {
    return null;
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants.fadeIn}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={variants.slideUp}
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('servicesList.title', {
              defaultValue: 'My Auto Services',
            })}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('servicesList.subtitle', {
              defaultValue: 'Manage all your auto services and their profiles',
            })}
          </p>
        </div>
        {/* Create Another Service Button - Always visible when user has services */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="primary"
            onClick={() => router.push('/my-service?create=true')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('servicesList.createAnother', {
              defaultValue: 'Create Another',
            })}
          </Button>
        </motion.div>
      </motion.div>

      <div suppressHydrationWarning>
        {/* Incomplete Services */}
        {incompleteServices.length > 0 && (
          <motion.div
            variants={variants.slideUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.1 }}
          >
            <SectionHeader
              icon={AlertCircle}
              title={t('servicesList.incomplete', {
                defaultValue: 'Incomplete Services',
                count: incompleteServices.length,
              })}
              count={incompleteServices.length}
              iconColor="text-amber-500"
              badgeColor="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
              animated
            />
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {incompleteServices.map((provider, index) => (
                <ServiceCard
                  key={provider.id}
                  service={provider}
                  index={index}
                  variant="incomplete"
                  isSelected={selectedProviderId === provider.id}
                  getServiceTypeLabel={getServiceTypeLabel}
                  onSelect={handleSelectService}
                  onDelete={handleDelete}
                  deleting={deletingServiceId === provider.id}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Complete Services */}
        {completeServices.length > 0 && (
          <motion.div
            variants={variants.slideUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.15 }}
          >
            <SectionHeader
              icon={CheckCircle2}
              title={t('servicesList.complete', {
                defaultValue: 'Complete Services',
                count: completeServices.length,
              })}
              count={completeServices.length}
              iconColor="text-green-500"
              badgeColor="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
            />
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {completeServices.map((provider, index) => (
                <ServiceCard
                  key={provider.id}
                  service={provider}
                  index={index}
                  variant="complete"
                  isSelected={selectedProviderId === provider.id}
                  getServiceTypeLabel={getServiceTypeLabel}
                  onSelect={handleSelectService}
                  onDelete={handleDelete}
                  deleting={deletingServiceId === provider.id}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Summary */}
        <ServicesSummary
          total={ownedServices.length}
          complete={completeServices.length}
          incomplete={incompleteServices.length}
        />
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, serviceId: '', hasBranch: false })}
        onConfirm={confirmDelete}
        title={t('servicesList.delete', { defaultValue: 'Delete Auto Service' })}
        message={
          deleteConfirm.hasBranch
            ? t('servicesList.deleteConfirmSoft', {
                defaultValue:
                  'Are you sure you want to delete this auto service? This action can be undone by contacting support.',
              })
            : t('servicesList.deleteConfirmPermanent', {
                defaultValue:
                  'Are you sure you want to permanently delete this auto service? This action cannot be undone.',
              })
        }
        variant="danger"
        confirmText={tCommon('delete', { defaultValue: 'Delete' })}
        cancelText={tCommon('cancel', { defaultValue: 'Cancel' })}
        isLoading={deleteMutation.isPending && deletingServiceId === deleteConfirm.serviceId}
      />
    </motion.div>
  );
}

// Legacy export
