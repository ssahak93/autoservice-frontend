'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QrCode, Copy, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { teamService, type InviteTeamMemberRequest } from '@/lib/services/team.service';
import { useUIStore } from '@/stores/uiStore';

interface InviteTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteTeamMemberModal({ isOpen, onClose }: InviteTeamMemberModalProps) {
  const t = useTranslations('dashboard.team.invite');
  const { showToast } = useUIStore();
  const queryClient = useQueryClient();
  const [qrData, setQrData] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const schema = z.object({
    role: z.enum(['owner', 'manager', 'employee'], {
      required_error: t('roleRequired', { defaultValue: 'Role is required' }),
    }),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    specialization: z.string().optional(),
    bio: z.string().optional(),
    yearsOfExperience: z.number().min(0).max(100).optional(),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: 'employee',
    },
  });

  const generateQRMutation = useMutation({
    mutationFn: (data: InviteTeamMemberRequest) =>
      teamService.generateInvitationQR(data, selectedAutoServiceId || undefined),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      setQrData(response.qrUrl);
      showToast(t('success', { defaultValue: 'QR code generated successfully' }), 'success');
    },
    onError: (error: Error) => {
      showToast(
        error.message || t('error', { defaultValue: 'Failed to generate QR code' }),
        'error'
      );
    },
  });

  const onSubmit = (data: FormData) => {
    generateQRMutation.mutate(data);
  };

  const handleCopy = () => {
    if (qrData) {
      navigator.clipboard.writeText(qrData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    reset();
    setQrData(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('title', { defaultValue: 'Invite Team Member' })}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!qrData ? (
          <>
            {/* Role */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('role', { defaultValue: 'Role' })} *
              </label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="employee">
                      {t('roles.employee', { defaultValue: 'Employee' })}
                    </option>
                    <option value="manager">
                      {t('roles.manager', { defaultValue: 'Manager' })}
                    </option>
                  </select>
                )}
              />
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
            </div>

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

            {/* Specialization */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('specialization', { defaultValue: 'Specialization' })}
              </label>
              <input
                {...register('specialization')}
                type="text"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder={t('specializationPlaceholder', {
                  defaultValue: 'e.g., Engine repair, Diagnostics',
                })}
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
                placeholder={t('bioPlaceholder', { defaultValue: 'Short description...' })}
              />
            </div>

            {/* Years of Experience */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('yearsOfExperience', { defaultValue: 'Years of Experience' })}
              </label>
              <input
                {...register('yearsOfExperience', { valueAsNumber: true })}
                type="number"
                min="0"
                max="100"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                {t('cancel', { defaultValue: 'Cancel' })}
              </Button>
              <Button type="submit" isLoading={generateQRMutation.isPending}>
                <QrCode className="mr-2 h-4 w-4" />
                {t('generateQR', { defaultValue: 'Generate QR Code' })}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-6 text-center dark:bg-gray-800">
              <QrCode className="mx-auto h-24 w-24 text-primary-600" />
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                {t('qrInstructions', {
                  defaultValue:
                    'Share this QR code with the team member to scan and join your team.',
                })}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('invitationLink', { defaultValue: 'Invitation Link' })}
                </p>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {t('copied', { defaultValue: 'Copied' })}
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      {t('copy', { defaultValue: 'Copy' })}
                    </>
                  )}
                </Button>
              </div>
              <p className="mt-2 break-all text-xs text-gray-600 dark:text-gray-400">{qrData}</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleClose}>
                {t('close', { defaultValue: 'Close' })}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
