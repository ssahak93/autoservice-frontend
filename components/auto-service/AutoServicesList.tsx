'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Settings, Plus, Trash2, ShieldCheck, Ban } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from '@/i18n/routing';
import { autoServicesService } from '@/lib/services/auto-services.service';
import { cn } from '@/lib/utils/cn';
import { useAutoServiceStore } from '@/stores/autoServiceStore';
import { useUIStore } from '@/stores/uiStore';

/**
 * Component to display all user's auto services with their completion status
 * Shows which services have profiles and which don't
 */
export function AutoServicesList() {
  const t = useTranslations('myService');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { user } = useAuth();
  const { selectedAutoServiceId, setSelectedAutoServiceId } = useAutoServiceStore();
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    serviceId: string;
    hasProfile: boolean;
  }>({ isOpen: false, serviceId: '', hasProfile: false });
  const deleteConfirmRef = useRef(deleteConfirm);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep ref in sync with state
  useEffect(() => {
    deleteConfirmRef.current = deleteConfirm;
  }, [deleteConfirm]);

  // Fetch available auto services
  const { data: availableServicesResponse, isLoading } = useQuery({
    queryKey: ['availableAutoServices'],
    queryFn: async () => {
      try {
        return await autoServicesService.getAvailableAutoServices();
      } catch (error) {
        console.error('Failed to fetch available auto services:', error);
        return [];
      }
    },
    enabled: !!user && mounted,
    refetchOnMount: true, // Always refetch to get latest data
  });

  // Ensure availableServices is always an array
  // The service should already return an array, but add safety check
  const availableServices = Array.isArray(availableServicesResponse)
    ? availableServicesResponse
    : [];

  // Use user.autoServices as fallback if availableServices is empty but user has services
  // This handles the case where the API might not have returned data yet
  const ownedServicesFromUser =
    user?.autoServices?.map((s) => ({
      id: s.id,
      name:
        s.serviceType === 'company'
          ? s.companyName || 'My Service'
          : `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'My Service',
      role: 'owner' as const,
      serviceType: s.serviceType,
      companyName: s.companyName,
      firstName: s.firstName,
      lastName: s.lastName,
      isVerified: s.isVerified,
      avatarFile: s.avatarFile || null,
      hasProfile: false, // We don't know from user data, will be updated by API
    })) || [];

  // Filter only owned services (role === 'owner')
  // Ensure we're working with an array
  const ownedServicesFromAPI = Array.isArray(availableServices)
    ? availableServices.filter((s) => s && s.role === 'owner')
    : [];

  // Use API data if available, otherwise fallback to user data
  const ownedServices =
    ownedServicesFromAPI.length > 0 ? ownedServicesFromAPI : ownedServicesFromUser;

  const incompleteServices = Array.isArray(ownedServices)
    ? ownedServices.filter((s) => s && !s.hasProfile)
    : [];
  const completeServices = Array.isArray(ownedServices)
    ? ownedServices.filter((s) => s && s.hasProfile)
    : [];

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Delete mutation - must be called before conditional returns
  const deleteMutation = useMutation({
    mutationFn: (serviceId: string) => autoServicesService.deleteAutoService(serviceId),
    onSuccess: async () => {
      showToast(
        t('servicesList.deleteSuccess', { defaultValue: 'Auto service deleted successfully' }),
        'success'
      );
      // Invalidate and refetch
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['availableAutoServices'] }),
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }),
      ]);
      // Clear selection if deleted service was selected
      if (selectedAutoServiceId && deletingServiceId === selectedAutoServiceId) {
        setSelectedAutoServiceId(null);
      }
      setDeletingServiceId(null);
    },
    onError: (error: unknown) => {
      const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        errorObj?.response?.data?.message ||
        errorObj?.message ||
        t('servicesList.deleteError', { defaultValue: 'Failed to delete auto service' });
      showToast(errorMessage, 'error');
      setDeletingServiceId(null);
    },
  });

  // NOW we can do conditional returns - all hooks have been called
  if (!mounted || isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    );
  }

  // Don't show if no services
  if (ownedServices.length === 0) {
    return null;
  }

  // Always show the list if user has services
  // This helps users see and manage all their services, especially incomplete ones
  // Only hide if user has exactly one complete service (no need to show list for single service)
  const shouldShow =
    ownedServices.length > 1 ||
    incompleteServices.length > 0 ||
    (ownedServices.length === 1 && !ownedServices[0].hasProfile);

  // If user has exactly one complete service, show a compact view with create button
  if (!shouldShow && ownedServices.length === 1) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
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

        {/* Create Another Service Button */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('servicesList.createAnother', {
                  defaultValue: 'Create Another Auto Service',
                })}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {t('servicesList.createAnotherDescription', {
                  defaultValue:
                    'You can create multiple auto services to manage different locations or service types.',
                })}
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => router.push('/my-service?create=true')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {t('servicesList.createAnother', {
                defaultValue: 'Create Another Auto Service',
              })}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!shouldShow) {
    return null;
  }

  const handleSelectService = (serviceId: string) => {
    setSelectedAutoServiceId(serviceId);
    router.push('/my-service');
  };

  const handleDelete = (serviceId: string, hasProfile: boolean) => {
    setDeleteConfirm({ isOpen: true, serviceId, hasProfile });
  };

  const confirmDelete = () => {
    const current = deleteConfirmRef.current;
    if (!current.serviceId) return;
    setDeletingServiceId(current.serviceId);
    deleteMutation.mutate(current.serviceId);
    setDeleteConfirm({ isOpen: false, serviceId: '', hasProfile: false });
  };

  // Helper to get service type translation
  const getServiceTypeLabel = (serviceType: 'individual' | 'company') => {
    return serviceType === 'company'
      ? t('create.company', { defaultValue: 'Company' })
      : t('create.individual', { defaultValue: 'Individual' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
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
      </div>

      <div suppressHydrationWarning>
        {/* Incomplete Services */}
        {incompleteServices.length > 0 && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('servicesList.incomplete', {
                  defaultValue: 'Incomplete Services',
                  count: incompleteServices.length,
                })}
              </h2>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                {incompleteServices.length}
              </span>
            </div>
            <div className="space-y-3">
              {incompleteServices.map((service) => (
                <div
                  key={service.id}
                  className={cn(
                    'rounded-lg border-2 p-4 transition-all',
                    selectedAutoServiceId === service.id
                      ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20'
                      : 'border-amber-200 bg-white dark:border-amber-800 dark:bg-gray-800'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {service.avatarFile ? (
                        <Image
                          src={service.avatarFile.fileUrl}
                          alt={service.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                          <Settings className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {service.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {getServiceTypeLabel(service.serviceType)}
                        </p>
                        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                          {t('servicesList.profileMissing', {
                            defaultValue: 'Profile not created',
                          })}
                        </p>
                        {service.isBlocked && (
                          <div className="mt-2 rounded-md bg-red-50 p-2 dark:bg-red-900/20">
                            <div className="flex items-start gap-2">
                              <Ban className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-red-800 dark:text-red-300">
                                  {t('servicesList.blocked', {
                                    defaultValue: 'This service is blocked',
                                  })}
                                </p>
                                {service.blockedReason && (
                                  <p className="mt-1 text-xs text-red-700 dark:text-red-400">
                                    {service.blockedReason}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSelectService(service.id)}
                        disabled={service.isBlocked}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        {t('servicesList.createProfile', { defaultValue: 'Create Profile' })}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(service.id, false)}
                        disabled={deletingServiceId === service.id}
                        className="flex items-center gap-2 text-red-600 hover:border-red-300 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                        {tCommon('delete', { defaultValue: 'Delete' })}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complete Services */}
        {completeServices.length > 0 && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('servicesList.complete', {
                  defaultValue: 'Complete Services',
                  count: completeServices.length,
                })}
              </h2>
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                {completeServices.length}
              </span>
            </div>
            <div className="space-y-3">
              {completeServices.map((service) => (
                <div
                  key={service.id}
                  className={cn(
                    'rounded-lg border-2 p-4 transition-all',
                    selectedAutoServiceId === service.id
                      ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20'
                      : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {service.avatarFile ? (
                        <Image
                          src={service.avatarFile.fileUrl}
                          alt={service.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                          <Settings className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {service.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {getServiceTypeLabel(service.serviceType)}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <p className="text-xs text-green-600 dark:text-green-400">
                            {t('servicesList.profileComplete', {
                              defaultValue: 'Profile complete',
                            })}
                          </p>
                          {service.hasProfile && service.isApproved && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              <ShieldCheck className="h-3 w-3" />
                              {t('servicesList.approved', { defaultValue: 'Approved' })}
                            </span>
                          )}
                          {service.hasProfile && !service.isApproved && service.rejectionReason && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                              <AlertCircle className="h-3 w-3" />
                              {t('servicesList.rejected', { defaultValue: 'Rejected' })}
                            </span>
                          )}
                          {service.hasProfile &&
                            !service.isApproved &&
                            !service.rejectionReason && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                <AlertCircle className="h-3 w-3" />
                                {t('servicesList.pendingApproval', {
                                  defaultValue: 'Pending Approval',
                                })}
                              </span>
                            )}
                        </div>
                        {service.isBlocked && (
                          <div className="mt-2 rounded-md bg-red-50 p-2 dark:bg-red-900/20">
                            <div className="flex items-start gap-2">
                              <Ban className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-red-800 dark:text-red-300">
                                  {t('servicesList.blocked', {
                                    defaultValue: 'This service is blocked',
                                  })}
                                </p>
                                {service.blockedReason && (
                                  <p className="mt-1 text-xs text-red-700 dark:text-red-400">
                                    {service.blockedReason}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectService(service.id)}
                        disabled={service.isBlocked}
                        className="flex items-center gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        {t('servicesList.manage', { defaultValue: 'Manage' })}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(service.id, true)}
                        disabled={deletingServiceId === service.id}
                        className="flex items-center gap-2 text-red-600 hover:border-red-300 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                        {tCommon('delete', { defaultValue: 'Delete' })}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('servicesList.summary', {
              defaultValue:
                'You have {total} auto service(s): {complete} complete, {incomplete} incomplete',
              total: ownedServices.length,
              complete: completeServices.length,
              incomplete: incompleteServices.length,
            })}
          </p>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, serviceId: '', hasProfile: false })}
        onConfirm={confirmDelete}
        title={t('servicesList.delete', { defaultValue: 'Delete Auto Service' })}
        message={
          deleteConfirm.hasProfile
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
    </div>
  );
}
