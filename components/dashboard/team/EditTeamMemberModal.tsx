'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Crown, Shield, Briefcase } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  teamService,
  type TeamMember,
  type UpdateTeamMemberRequest,
} from '@/lib/services/team.service';
import { useAutoServiceStore } from '@/stores/autoServiceStore';
import { useUIStore } from '@/stores/uiStore';

interface EditTeamMemberModalProps {
  member: TeamMember;
  isOpen: boolean;
  onClose: () => void;
  isOwner: boolean;
}

export function EditTeamMemberModal({
  member,
  isOpen,
  onClose,
  isOwner,
}: EditTeamMemberModalProps) {
  const t = useTranslations('dashboard.team.edit');
  const tRoles = useTranslations('dashboard.team.roles');
  const { selectedAutoServiceId } = useAutoServiceStore();
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();

  const schema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    specialization: z.string().optional(),
    bio: z.string().optional(),
    role: z.enum(['owner', 'manager', 'employee']).optional(),
    isActive: z.boolean().optional(),
    yearsOfExperience: z.number().min(0).max(100).optional(),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      // firstName and lastName are not editable, so we don't need them in the form
      specialization: member.specialization || '',
      bio: member.bio || '',
      role: member.role,
      isActive: member.isActive,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateTeamMemberRequest) =>
      teamService.updateTeamMember(member.id, data, selectedAutoServiceId || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      showToast(t('success', { defaultValue: 'Team member updated successfully' }), 'success');
      onClose();
    },
    onError: (error: Error) => {
      showToast(
        error.message || t('error', { defaultValue: 'Failed to update team member' }),
        'error'
      );
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'manager':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'employee':
        return <Briefcase className="h-4 w-4 text-gray-500" />;
      default:
        return <User className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return tRoles('owner', { defaultValue: 'Owner' });
      case 'manager':
        return tRoles('manager', { defaultValue: 'Manager' });
      case 'employee':
        return tRoles('employee', { defaultValue: 'Employee' });
      default:
        return role;
    }
  };

  const onSubmit = (data: FormData) => {
    // Remove firstName and lastName from the update - they are not editable
    const { firstName: _firstName, lastName: _lastName, ...updateData } = data;
    updateMutation.mutate(updateData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('title', { defaultValue: 'Edit Team Member' })}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Member Card - Read Only */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
              {member.avatarUrl ? (
                <Image
                  src={member.avatarUrl}
                  alt={`${member.firstName || ''} ${member.lastName || ''}`}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <User className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              )}
            </div>

            {/* Member Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {member.firstName || ''} {member.lastName || ''}
                </h3>
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                {getRoleIcon(member.role)}
                <span>{getRoleLabel(member.role)}</span>
              </div>
              {member.email && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">{member.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Role (only owner can change) */}
        {isOwner && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('role', { defaultValue: 'Role' })}
            </label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  disabled={member.role === 'owner'}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="employee">
                    {t('roles.employee', { defaultValue: 'Employee' })}
                  </option>
                  <option value="manager">{t('roles.manager', { defaultValue: 'Manager' })}</option>
                  <option value="owner" disabled>
                    {t('roles.owner', { defaultValue: 'Owner' })}
                  </option>
                </select>
              )}
            />
          </div>
        )}

        {/* Specialization */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('specialization', { defaultValue: 'Specialization' })}
          </label>
          <input
            {...register('specialization')}
            type="text"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('bio', { defaultValue: 'Bio' })}
          </label>
          <textarea
            {...register('bio')}
            rows={3}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Is Active (only owner can change) */}
        {isOwner && (
          <div>
            <label className="flex items-center gap-2">
              <input
                {...register('isActive')}
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('isActive', { defaultValue: 'Active' })}
              </span>
            </label>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button type="submit" isLoading={isSubmitting || updateMutation.isPending}>
            {t('save', { defaultValue: 'Save Changes' })}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
