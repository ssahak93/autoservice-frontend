'use client';

import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useAvailableProviders } from '@/hooks/useAvailableProviders';
import { useRouter } from '@/i18n/routing';
import { useProviderStore } from '@/stores/providerStore';

import { CreateProvider } from './CreateProvider';
import { MultipleProvidersView } from './MultipleProvidersView';
import { ProviderDashboard } from './ProviderDashboard';

/**
 * Main page component for managing providers
 * Modern, interactive design with improved UX
 */
export function MyProviderPage() {
  const t = useTranslations('myService');
  const { isLoading: isLoadingUser } = useAuth();
  const { selectedProviderId, setSelectedProviderId } = useProviderStore();
  const { ownedProviders, isLoading: isLoadingServices } = useAvailableProviders();
  const router = useRouter();
  const searchParams = useSearchParams();
  const showCreateForm = searchParams?.get('create') === 'true';

  // Determine if user has providers
  const hasProviders = useMemo(() => ownedProviders.length > 0, [ownedProviders.length]);

  // Determine if user has multiple providers
  const hasMultipleProviders = useMemo(() => ownedProviders.length > 1, [ownedProviders.length]);

  // Auto-select first provider if none selected and user has providers
  useEffect(() => {
    if (!isLoadingServices && hasProviders && !selectedProviderId) {
      setSelectedProviderId(ownedProviders[0].id);
    }
  }, [isLoadingServices, hasProviders, selectedProviderId, ownedProviders, setSelectedProviderId]);

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
              <CreateProvider />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // If user has no providers, show modern create form
  if (!hasProviders) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <CreateProvider />
        </div>
      </ProtectedRoute>
    );
  }

  // If user has one provider, show single provider dashboard
  if (!hasMultipleProviders) {
    return (
      <ProtectedRoute>
        <ProviderDashboard providerId={ownedProviders[0].id} />
      </ProtectedRoute>
    );
  }

  // If user has multiple providers, show multiple providers view
  return (
    <ProtectedRoute>
      <MultipleProvidersView />
    </ProtectedRoute>
  );
}
