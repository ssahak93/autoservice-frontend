'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Copy, QrCode, Trash2, Check, Clock, X } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { teamService, type PendingInvitation } from '@/lib/services/team.service';
import { formatDateFull } from '@/lib/utils/date';
import { handleMutationError, handleMutationSuccess } from '@/lib/utils/toast';
import { formatUserName } from '@/lib/utils/user';
import { useProviderStore } from '@/stores/providerStore';
import { useUIStore } from '@/stores/uiStore';

interface PendingInvitationsListProps {
  invitations: PendingInvitation[];
  providerId?: string;
}

export function PendingInvitationsList({ invitations, providerId }: PendingInvitationsListProps) {
  const t = useTranslations('dashboard.team.invitations');
  const tInvite = useTranslations('dashboard.team.invite'); // Use existing translations for QR code section
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { showToast } = useUIStore();
  const { selectedProviderId } = useProviderStore();
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; invitationId: string }>({
    isOpen: false,
    invitationId: '',
  });
  const [showQRModal, setShowQRModal] = useState<{
    isOpen: boolean;
    invitation: PendingInvitation | null;
  }>({
    isOpen: false,
    invitation: null,
  });

  const cancelMutation = useMutation({
    mutationFn: (invitationId: string) =>
      teamService.cancelInvitation(invitationId, providerId || selectedProviderId || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamInvitations'] });
      queryClient.invalidateQueries({ queryKey: ['team'] });
      showToast(
        t('cancelSuccess', { defaultValue: 'Invitation cancelled successfully' }),
        'success'
      );
    },
    onError: (error: Error) => {
      handleMutationError(
        error,
        t('cancelError', { defaultValue: 'Failed to cancel invitation' }),
        showToast
      );
    },
  });

  const handleCopy = async (url: string, invitationId: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(invitationId);
      handleMutationSuccess(
        t('linkCopied', { defaultValue: 'Invitation link copied!' }),
        showToast
      );
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      handleMutationError(
        error,
        t('copyError', { defaultValue: 'Failed to copy link' }),
        showToast
      );
    }
  };

  const handleDelete = (invitation: PendingInvitation) => {
    setDeleteConfirm({ isOpen: true, invitationId: invitation.id });
  };

  const confirmDelete = () => {
    cancelMutation.mutate(deleteConfirm.invitationId);
    setDeleteConfirm({ isOpen: false, invitationId: '' });
  };

  const handleShowQR = (invitation: PendingInvitation) => {
    setShowQRModal({ isOpen: true, invitation });
  };

  if (invitations.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('title', { defaultValue: 'Pending Invitations' })}
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {invitations.length} {t('pending', { defaultValue: 'pending' })}
          </span>
        </div>

        <div className="space-y-3">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="glass-light rounded-lg border border-gray-200 p-4 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
                      <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatUserName(
                            invitation.firstName,
                            invitation.lastName,
                            t('pendingMember', { defaultValue: 'Pending Member' })
                          )}
                        </p>
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                          {invitation.role}
                        </span>
                      </div>
                      {invitation.specialization && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {invitation.specialization}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                        {t('invitedAt', { defaultValue: 'Invited' })}:{' '}
                        {formatDateFull(invitation.invitedAt, locale)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {invitation.qrUrl && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShowQR(invitation)}
                        title={t('viewQR', { defaultValue: 'View QR Code' })}
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          invitation.qrUrl && handleCopy(invitation.qrUrl, invitation.id)
                        }
                        title={t('copyLink', { defaultValue: 'Copy Invitation Link' })}
                      >
                        {copiedId === invitation.id ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(invitation)}
                    title={t('cancel', { defaultValue: 'Cancel Invitation' })}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal.isOpen && showQRModal.invitation && showQRModal.invitation.qrUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('qrCode', { defaultValue: 'QR Code' })}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQRModal({ isOpen: false, invitation: null })}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="mb-4 rounded-lg bg-white p-6 text-center dark:bg-gray-800">
              {showQRModal.invitation.qrUrl && (
                <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-lg border-4 border-primary-100 bg-white p-4 dark:border-primary-900 dark:bg-gray-700">
                  {showQRModal.invitation.qrCodeSvg ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: showQRModal.invitation.qrCodeSvg }}
                      className="h-full w-full"
                    />
                  ) : (
                    <div className="h-full w-full animate-pulse rounded bg-gray-200 dark:bg-gray-600" />
                  )}
                </div>
              )}
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                {tInvite('qrInstructions', {
                  defaultValue:
                    'Share this QR code with the team member to scan and join your team.',
                })}
              </p>
            </div>
            <div className="mb-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('invitationLink', { defaultValue: 'Invitation Link' })}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (showQRModal.invitation?.qrUrl) {
                      handleCopy(showQRModal.invitation.qrUrl, showQRModal.invitation.id);
                    }
                  }}
                >
                  {copiedId === showQRModal.invitation.id ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-green-600" />
                      {tInvite('copied', { defaultValue: 'Copied' })}
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      {tInvite('copy', { defaultValue: 'Copy' })}
                    </>
                  )}
                </Button>
              </div>
              <p className="mt-2 break-all text-xs text-gray-600 dark:text-gray-400">
                {showQRModal.invitation.qrUrl}
              </p>
            </div>
            <Button
              variant="primary"
              fullWidth
              onClick={() => setShowQRModal({ isOpen: false, invitation: null })}
            >
              {tCommon('close', { defaultValue: 'Close' })}
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, invitationId: '' })}
        onConfirm={confirmDelete}
        title={t('cancelInvitation', { defaultValue: 'Cancel Invitation' })}
        message={t('cancelConfirm', {
          defaultValue:
            'Are you sure you want to cancel this invitation? This action cannot be undone.',
        })}
        variant="danger"
        confirmText={t('cancel', { defaultValue: 'Cancel Invitation' })}
        cancelText={tCommon('cancel', { defaultValue: 'Cancel' })}
        isLoading={cancelMutation.isPending}
      />
    </>
  );
}
