'use client';

import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useAvailableAutoServices } from '@/hooks/useAvailableAutoServices';
import { useRouter } from '@/i18n/routing';
import { useAutoServiceStore } from '@/stores/autoServiceStore';

import { CreateAutoService } from './CreateAutoService';
import { MultipleServicesView } from './MultipleServicesView';
import { ServiceDashboard } from './ServiceDashboard';

/**
 * Main page component for managing auto services
 * Modern, interactive design with improved UX
 */
export function MyServicePage() {
  const t = useTranslations('myService');
  const { isLoading: isLoadingUser } = useAuth();
  const { selectedAutoServiceId, setSelectedAutoServiceId } = useAutoServiceStore();
  const { ownedServices, isLoading: isLoadingServices } = useAvailableAutoServices();
  const router = useRouter();
  const searchParams = useSearchParams();
  const showCreateForm = searchParams?.get('create') === 'true';

  // Determine if user has services
  const hasServices = useMemo(() => ownedServices.length > 0, [ownedServices.length]);

  // Determine if user has multiple services
  const hasMultipleServices = useMemo(() => ownedServices.length > 1, [ownedServices.length]);

  // Auto-select first service if none selected and user has services
  useEffect(() => {
    if (!isLoadingServices && hasServices && !selectedAutoServiceId) {
      setSelectedAutoServiceId(ownedServices[0].id);
    }
  }, [
    isLoadingServices,
    hasServices,
    selectedAutoServiceId,
    ownedServices,
    setSelectedAutoServiceId,
  ]);

  // Loading state with modern skeleton
  if (isLoadingUser || isLoadingServices) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('loading', { defaultValue: 'Loading your services...' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Show create form if explicitly requested
  if (showCreateForm) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4 py-8">
            <div className="mx-auto max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Button
                  variant="outline"
                  onClick={() => router.push('/my-service')}
                  className="flex items-center gap-2"
                >
                  ← {t('back', { defaultValue: 'Back' })}
                </Button>
              </motion.div>
              <CreateAutoService />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // If user has no services, show modern create form
  if (!hasServices) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <CreateAutoService />
        </div>
      </ProtectedRoute>
    );
  }

  // If user has one service, show single service dashboard
  if (!hasMultipleServices) {
    return (
      <ProtectedRoute>
        <ServiceDashboard autoServiceId={ownedServices[0].id} />
      </ProtectedRoute>
    );
  }

  // If user has multiple services, show multiple services view
  return (
    <ProtectedRoute>
      <MultipleServicesView />
    </ProtectedRoute>
  );
}
