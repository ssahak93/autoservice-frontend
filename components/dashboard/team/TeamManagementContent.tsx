'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

import { ServiceCardSkeleton } from '@/components/auto-service/ServiceCardSkeleton';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import { autoServicesService } from '@/lib/services/auto-services.service';
import { teamService, type TeamMember } from '@/lib/services/team.service';
import { useAutoServiceStore } from '@/stores/autoServiceStore';
import { useUIStore } from '@/stores/uiStore';

// Lazy load modals to reduce initial bundle size
const EditTeamMemberModal = dynamic(
  () => import('./EditTeamMemberModal').then((mod) => ({ default: mod.EditTeamMemberModal })),
  {
    ssr: false,
  }
);
const InviteTeamMemberModal = dynamic(
  () => import('./InviteTeamMemberModal').then((mod) => ({ default: mod.InviteTeamMemberModal })),
  {
    ssr: false,
  }
);

import { PendingInvitationsList } from './PendingInvitationsList';
import { TeamMemberList } from './TeamMemberList';

export function TeamManagementContent() {
  const t = useTranslations('dashboard.team');
  const tCommon = useTranslations('common');
  const { user } = useAuth();
  const { selectedAutoServiceId, setAvailableAutoServices, setSelectedAutoServiceId } =
    useAutoServiceStore();
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [mounted, setMounted] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState<{ isOpen: boolean; memberId: string }>({
    isOpen: false,
    memberId: '',
  });

  // Ensure component only renders after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch available auto services to ensure selectedAutoServiceId is set
  const { data: availableServices = [] } = useQuery({
    queryKey: ['availableAutoServices'],
    queryFn: () => autoServicesService.getAvailableAutoServices(),
    enabled: !!user,
  });

  // Initialize available auto services and ensure a service is selected
  useEffect(() => {
    if (availableServices.length > 0) {
      // Map services to match AutoServiceOption type, ensuring role is correctly typed
      const mappedServices = availableServices.map((service) => ({
        id: service.id,
        name: service.name,
        role: (service.role === 'owner' || service.role === 'manager' || service.role === 'employee'
          ? service.role
          : 'employee') as 'owner' | 'manager' | 'employee',
        serviceType: service.serviceType,
        companyName: service.companyName ?? undefined,
        firstName: service.firstName ?? undefined,
        lastName: service.lastName ?? undefined,
        avatarFile: service.avatarFile
          ? {
              fileUrl: service.avatarFile.fileUrl,
            }
          : undefined,
        hasProfile: service.hasProfile,
        isApproved: service.isApproved,
      }));
      setAvailableAutoServices(mappedServices);
      // If no service is selected, select the first one
      if (!selectedAutoServiceId && mappedServices.length > 0) {
        const firstOwnedService = mappedServices.find((s) => s.role === 'owner');
        if (firstOwnedService) {
          setSelectedAutoServiceId(firstOwnedService.id);
        }
      }
    }
  }, [
    availableServices,
    selectedAutoServiceId,
    setAvailableAutoServices,
    setSelectedAutoServiceId,
  ]);

  const {
    data: teamMembers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['team', selectedAutoServiceId],
    queryFn: () => teamService.getTeam(selectedAutoServiceId || undefined),
    enabled: !!user && !!selectedAutoServiceId, // Only fetch when user is loaded and service is selected
  });

  // Check if current user is owner from available services (for enabling queries)
  const isOwnerFromAvailableServices = availableServices.some(
    (s) => s.id === selectedAutoServiceId && s.role === 'owner'
  );

  // Fetch pending invitations (only for owners)
  const { data: pendingInvitations = [], isLoading: isLoadingInvitations } = useQuery({
    queryKey: ['teamInvitations', selectedAutoServiceId],
    queryFn: () => teamService.getPendingInvitations(selectedAutoServiceId || undefined),
    enabled: !!user && !!selectedAutoServiceId && isOwnerFromAvailableServices, // Only fetch for owners
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) =>
      teamService.removeTeamMember(memberId, selectedAutoServiceId || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      showToast(
        t('removeSuccess', { defaultValue: 'Team member removed successfully' }),
        'success'
      );
    },
    onError: (error: Error) => {
      showToast(
        error.message || t('removeError', { defaultValue: 'Failed to remove team member' }),
        'error'
      );
    },
  });

  const handleRemove = (member: TeamMember) => {
    setRemoveConfirm({ isOpen: true, memberId: member.id });
  };

  const confirmRemove = () => {
    removeMutation.mutate(removeConfirm.memberId);
    setRemoveConfirm({ isOpen: false, memberId: '' });
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
  };

  const handleCloseEdit = () => {
    setEditingMember(null);
  };

  // Check if current user is owner
  // Check from available services first (faster), then from team members
  const currentUserService = availableServices.find((s) => s.id === selectedAutoServiceId);
  const isOwnerFromService = currentUserService?.role === 'owner';
  const currentUserMember = teamMembers.find((m) => m.userId === user?.id);
  const isOwner = isOwnerFromService || currentUserMember?.role === 'owner';
  const isManager =
    currentUserService?.role === 'manager' || currentUserMember?.role === 'manager' || isOwner;

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ServiceCardSkeleton count={3} layout="list" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 p-6 text-red-800 dark:bg-red-900/20 dark:text-red-200">
          {t('loadError', { defaultValue: 'Failed to load team members. Please try again.' })}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('title', { defaultValue: 'Team Management' })}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t('description', { defaultValue: 'Manage your team members and their permissions' })}
          </p>
        </div>
        {isOwner && (
          <Button onClick={() => setIsInviteModalOpen(true)}>
            <Plus className="mr-2 h-5 w-5" />
            {t('inviteMember', { defaultValue: 'Invite Member' })}
          </Button>
        )}
      </div>

      {/* Team Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="glass-light rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('totalMembers', { defaultValue: 'Total Members' })}
              </p>
              <p
                className="text-2xl font-bold text-gray-900 dark:text-white"
                suppressHydrationWarning
              >
                {teamMembers?.length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="glass-light rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('activeMembers', { defaultValue: 'Active Members' })}
              </p>
              <p
                className="text-2xl font-bold text-gray-900 dark:text-white"
                suppressHydrationWarning
              >
                {teamMembers?.filter((m) => m.isActive).length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="glass-light rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('employees', { defaultValue: 'Employees' })}
              </p>
              <p
                className="text-2xl font-bold text-gray-900 dark:text-white"
                suppressHydrationWarning
              >
                {teamMembers?.filter((m) => m.role === 'employee').length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Invitations List (only for owners) */}
      {isOwner && (
        <div className="mb-6">
          {isLoadingInvitations ? (
            <div className="glass-light rounded-xl p-6">
              <div className="h-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
          ) : (
            <PendingInvitationsList
              invitations={pendingInvitations}
              autoServiceId={selectedAutoServiceId || undefined}
            />
          )}
        </div>
      )}

      {/* Team Members List */}
      <div className="glass-light rounded-xl p-6">
        <TeamMemberList
          members={teamMembers}
          currentUserId={user?.id}
          isOwner={isOwner}
          isManager={isManager}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <InviteTeamMemberModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}

      {/* Edit Modal */}
      {editingMember && (
        <EditTeamMemberModal
          member={editingMember}
          isOpen={!!editingMember}
          onClose={handleCloseEdit}
          isOwner={isOwner}
        />
      )}

      <ConfirmDialog
        isOpen={removeConfirm.isOpen}
        onClose={() => setRemoveConfirm({ isOpen: false, memberId: '' })}
        onConfirm={confirmRemove}
        title={t('remove', { defaultValue: 'Remove Team Member' })}
        message={t('removeConfirm', {
          defaultValue: 'Are you sure you want to remove this team member?',
        })}
        variant="danger"
        confirmText={t('remove', { defaultValue: 'Remove' })}
        cancelText={tCommon('cancel', { defaultValue: 'Cancel' })}
        isLoading={removeMutation.isPending}
      />
    </div>
  );
}
