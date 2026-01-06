'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
      firstName: member.firstName,
      lastName: member.lastName,
      specialization: member.specialization || '',
      bio: member.bio || '',
      role: member.role,
      isActive: member.isActive,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateTeamMemberRequest) => teamService.updateTeamMember(member.id, data),
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

  const onSubmit = (data: FormData) => {
    updateMutation.mutate(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('title', { defaultValue: 'Edit Team Member' })}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* First Name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('firstName', { defaultValue: 'First Name' })}
          </label>
          <input
            {...register('firstName')}
            type="text"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('lastName', { defaultValue: 'Last Name' })}
          </label>
          <input
            {...register('lastName')}
            type="text"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
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
