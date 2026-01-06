'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { teamService, type TeamMember } from '@/lib/services/team.service';
import { useUIStore } from '@/stores/uiStore';

import { EditTeamMemberModal } from './EditTeamMemberModal';
import { InviteTeamMemberModal } from './InviteTeamMemberModal';
import { TeamMemberList } from './TeamMemberList';

export function TeamManagementContent() {
  const t = useTranslations('dashboard.team');
  const { user } = useAuth();
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const {
    data: teamMembers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['team'],
    queryFn: () => teamService.getTeam(),
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => teamService.removeTeamMember(memberId),
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
    if (
      window.confirm(
        t('removeConfirm', { defaultValue: 'Are you sure you want to remove this team member?' })
      )
    ) {
      removeMutation.mutate(member.id);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
  };

  const handleCloseEdit = () => {
    setEditingMember(null);
  };

  // Check if current user is owner
  const currentUserMember = teamMembers.find((m) => m.userId === user?.id);
  const isOwner = currentUserMember?.role === 'owner';
  const isManager = currentUserMember?.role === 'manager' || isOwner;

  if (isLoading) {
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {teamMembers.length}
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {teamMembers.filter((m) => m.isActive).length}
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {teamMembers.filter((m) => m.role === 'employee').length}
              </p>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}
