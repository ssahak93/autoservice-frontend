'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useAutoServiceVisits } from '@/hooks/useDashboard';
import { visitsService } from '@/lib/services/visits.service';
import { useAutoServiceStore } from '@/stores/autoServiceStore';
import { useUIStore } from '@/stores/uiStore';
import type { Visit } from '@/types';

// Lazy load modals to reduce initial bundle size
const AcceptVisitModal = dynamic(
  () => import('./AcceptVisitModal').then((mod) => ({ default: mod.AcceptVisitModal })),
  {
    ssr: false,
  }
);
const CancelVisitModal = dynamic(
  () => import('./CancelVisitModal').then((mod) => ({ default: mod.CancelVisitModal })),
  {
    ssr: false,
  }
);
const CompleteVisitModal = dynamic(
  () => import('./CompleteVisitModal').then((mod) => ({ default: mod.CompleteVisitModal })),
  {
    ssr: false,
  }
);
const RescheduleVisitModal = dynamic(
  () => import('./RescheduleVisitModal').then((mod) => ({ default: mod.RescheduleVisitModal })),
  {
    ssr: false,
  }
);
const VisitDetailsModal = dynamic(
  () => import('./VisitDetailsModal').then((mod) => ({ default: mod.VisitDetailsModal })),
  {
    ssr: false,
  }
);

import { VisitFilters } from './VisitFilters';
import { VisitList } from './VisitList';

type VisitAction = 'view' | 'accept' | 'complete' | 'cancel' | 'reschedule' | null;

export function VisitsManagementContent() {
  const t = useTranslations('dashboard.visits');
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();
  const { selectedAutoServiceId } = useAutoServiceStore();

  const [filters, setFilters] = useState<{
    status?: string;
    date?: string;
    page?: number;
    limit?: number;
  }>({
    page: 1,
    limit: 20,
  });

  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [action, setAction] = useState<VisitAction>(null);

  const { data: visitsData, isLoading } = useAutoServiceVisits(filters);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleVisitClick = (visit: Visit) => {
    setSelectedVisit(visit);
    setAction('view');
  };

  const handleAction = (visit: Visit, actionType: VisitAction) => {
    setSelectedVisit(visit);
    setAction(actionType);
  };

  const closeModal = () => {
    setSelectedVisit(null);
    setAction(null);
  };

  // Accept visit mutation
  const acceptMutation = useMutation({
    mutationFn: (data: {
      id: string;
      confirmedDate?: string;
      confirmedTime?: string;
      notes?: string;
    }) =>
      visitsService.acceptVisit(
        data.id,
        {
          confirmedDate: data.confirmedDate,
          confirmedTime: data.confirmedTime,
          notes: data.notes,
        },
        selectedAutoServiceId || undefined
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'visits'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'statistics'] });
      showToast(t('acceptSuccess', { defaultValue: 'Visit accepted successfully' }), 'success');
      closeModal();
    },
    onError: (error: Error) => {
      showToast(
        error.message || t('acceptError', { defaultValue: 'Failed to accept visit' }),
        'error'
      );
    },
  });

  // Complete visit mutation
  const completeMutation = useMutation({
    mutationFn: (data: { id: string; notes?: string }) =>
      visitsService.completeVisit(data.id, data.notes, selectedAutoServiceId || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'visits'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'statistics'] });
      showToast(t('completeSuccess', { defaultValue: 'Visit completed successfully' }), 'success');
      closeModal();
    },
    onError: (error: Error) => {
      showToast(
        error.message || t('completeError', { defaultValue: 'Failed to complete visit' }),
        'error'
      );
    },
  });

  // Cancel visit mutation
  const cancelMutation = useMutation({
    mutationFn: (data: { id: string; reason: string }) =>
      visitsService.cancel(data.id, data.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'visits'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'statistics'] });
      showToast(t('cancelSuccess', { defaultValue: 'Visit cancelled successfully' }), 'success');
      closeModal();
    },
    onError: (error: Error) => {
      showToast(
        error.message || t('cancelError', { defaultValue: 'Failed to cancel visit' }),
        'error'
      );
    },
  });

  // Reschedule visit mutation
  const rescheduleMutation = useMutation({
    mutationFn: (data: { id: string; scheduledDate: string; scheduledTime: string }) =>
      visitsService.rescheduleVisit(
        data.id,
        {
          scheduledDate: data.scheduledDate,
          scheduledTime: data.scheduledTime,
        },
        selectedAutoServiceId || undefined
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'visits'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'statistics'] });
      showToast(
        t('rescheduleSuccess', { defaultValue: 'Visit rescheduled successfully' }),
        'success'
      );
      closeModal();
    },
    onError: (error: Error) => {
      showToast(
        error.message || t('rescheduleError', { defaultValue: 'Failed to reschedule visit' }),
        'error'
      );
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('title', { defaultValue: 'Visit Management' })}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('description', { defaultValue: 'Manage and track all your service visits' })}
        </p>
      </div>

      <VisitFilters filters={filters} onFilterChange={handleFilterChange} />

      <VisitList
        visits={visitsData?.data || []}
        isLoading={isLoading}
        pagination={visitsData?.pagination}
        onPageChange={handlePageChange}
        onVisitClick={handleVisitClick}
        onAction={handleAction}
      />

      {/* Modals */}
      {selectedVisit && (
        <>
          <VisitDetailsModal
            visit={selectedVisit}
            isOpen={action === 'view'}
            onClose={closeModal}
            onAction={handleAction}
          />

          <AcceptVisitModal
            visit={selectedVisit}
            isOpen={action === 'accept'}
            onClose={closeModal}
            onAccept={(data) => acceptMutation.mutate({ id: selectedVisit.id, ...data })}
            isLoading={acceptMutation.isPending}
          />

          <CompleteVisitModal
            visit={selectedVisit}
            isOpen={action === 'complete'}
            onClose={closeModal}
            onComplete={(notes) => completeMutation.mutate({ id: selectedVisit.id, notes })}
            isLoading={completeMutation.isPending}
          />

          <CancelVisitModal
            visit={selectedVisit}
            isOpen={action === 'cancel'}
            onClose={closeModal}
            onCancel={(reason) => cancelMutation.mutate({ id: selectedVisit.id, reason })}
            isLoading={cancelMutation.isPending}
          />

          <RescheduleVisitModal
            visit={selectedVisit}
            isOpen={action === 'reschedule'}
            onClose={closeModal}
            onReschedule={(data) => rescheduleMutation.mutate({ id: selectedVisit.id, ...data })}
            isLoading={rescheduleMutation.isPending}
          />
        </>
      )}
    </div>
  );
}
