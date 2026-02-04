'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Link, useRouter } from '@/i18n/routing';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { extractErrorMessage, isConflictError } from '@/lib/utils/errorHandler';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

interface InvitationStatus {
  valid: boolean;
  autoServiceId?: string;
  autoServiceName?: string;
  role?: string;
  message: string;
  requiresRegistration: boolean;
  invitationCode?: string;
}

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const isAuthenticated = !!user;
  const { showToast } = useUIStore();
  const t = useTranslations('dashboard.team.invite');
  const code = params.code as string;

  const [isAccepting, setIsAccepting] = useState(false);

  // Check invitation status
  const { data: invitationStatus, isLoading } = useQuery<InvitationStatus>({
    queryKey: ['invitation', code],
    queryFn: async () => {
      const response = await apiClient.get<InvitationStatus>(
        API_ENDPOINTS.TEAM.CHECK_INVITATION(code)
      );
      return response.data;
    },
    enabled: !!code,
    retry: false,
  });

  // Accept invitation mutation
  const acceptMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(API_ENDPOINTS.TEAM.ACCEPT_INVITATION, {
        invitationCode: code,
      });
      return response.data;
    },
    onSuccess: () => {
      showToast(
        t('acceptSuccess', { defaultValue: 'Invitation accepted successfully!' }),
        'success'
      );
      router.push('/dashboard/team');
    },
    onError: (error: unknown) => {
      // Extract error details from Axios error structure
      // Error format: { response: { status: 409, data: { error: { code: "ConflictException", message: "User is already in this team" } } } }
      const errorObj = error as {
        response?: {
          status?: number;
          data?: {
            error?: {
              code?: string;
              message?: string;
            };
          };
        };
      };

      const status = errorObj?.response?.status;
      const errorCode = errorObj?.response?.data?.error?.code;
      const backendMessage = errorObj?.response?.data?.error?.message || extractErrorMessage(error);

      let errorMessage: string;

      // Handle 409 Conflict - user already in team
      if (status === 409 || isConflictError(error)) {
        // Check by error code or message content (support multiple languages)
        const isAlreadyInTeam =
          errorCode === 'ConflictException' ||
          backendMessage.toLowerCase().includes('already in') ||
          backendMessage.toLowerCase().includes('уже в') ||
          backendMessage.toLowerCase().includes('արդեն') ||
          backendMessage.toLowerCase().includes('уже является') ||
          backendMessage.toLowerCase().includes('user is already');

        if (isAlreadyInTeam) {
          errorMessage = t('alreadyInTeam', {
            defaultValue: 'You are already a member of this team',
          });
          // Redirect to team page after showing message
          setTimeout(() => {
            router.push('/dashboard/team');
          }, 2000);
        } else {
          // Other conflict errors - show the actual message from backend
          errorMessage =
            backendMessage || t('acceptError', { defaultValue: 'Failed to accept invitation' });
        }
      } else {
        // Other errors - show the actual message from backend
        errorMessage =
          backendMessage || t('acceptError', { defaultValue: 'Failed to accept invitation' });
      }

      showToast(errorMessage, 'error');
    },
  });

  const handleAccept = async () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      router.push(`/auth/login?redirect=${encodeURIComponent(`/invite/${code}`)}`);
      return;
    }

    setIsAccepting(true);
    try {
      await acceptMutation.mutateAsync();
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="text-gray-600 dark:text-gray-400">
            {t('loading', { defaultValue: 'Loading...' })}
          </p>
        </div>
      </div>
    );
  }

  if (!invitationStatus || !invitationStatus.valid) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="text-6xl">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('invalidTitle', { defaultValue: 'Invalid Invitation' })}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {invitationStatus?.message ||
              t('invalidMessage', {
                defaultValue: 'This invitation link is invalid or has already been used.',
              })}
          </p>
          <Link href="/">
            <Button variant="primary">{t('goHome', { defaultValue: 'Go to Home' })}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <div className="text-center">
          <div className="mb-4 text-6xl">🎉</div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            {t('invitationTitle', { defaultValue: 'Team Invitation' })}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {invitationStatus.message ||
              t('invitationMessage', { defaultValue: 'You have been invited to join a team' })}
          </p>
        </div>

        {invitationStatus.autoServiceName && (
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('serviceName', { defaultValue: 'Service' })}:
            </p>
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {invitationStatus.autoServiceName}
              </p>
              {invitationStatus.autoServiceId && (
                <Link
                  href={`/services/${invitationStatus.autoServiceId}`}
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  {t('viewService', { defaultValue: 'View Service' })}
                </Link>
              )}
            </div>
          </div>
        )}

        {invitationStatus.role && (
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('role', { defaultValue: 'Role' })}:
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {t(`roles.${invitationStatus.role.toLowerCase()}`, {
                defaultValue:
                  invitationStatus.role.charAt(0).toUpperCase() +
                  invitationStatus.role.slice(1).toLowerCase(),
              })}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {!isAuthenticated ? (
            <>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                {t('loginRequired', { defaultValue: 'Please log in to accept this invitation' })}
              </p>
              <Link href={`/login?redirect=${encodeURIComponent(`/invite/${code}`)}`}>
                <Button variant="primary" fullWidth>
                  {t('login', { defaultValue: 'Log In' })}
                </Button>
              </Link>
              <Link href={`/register?redirect=${encodeURIComponent(`/invite/${code}`)}`}>
                <Button variant="outline" fullWidth>
                  {t('register', { defaultValue: 'Register' })}
                </Button>
              </Link>
            </>
          ) : (
            <Button
              variant="primary"
              fullWidth
              onClick={handleAccept}
              isLoading={isAccepting || acceptMutation.isPending}
            >
              {t('accept', { defaultValue: 'Accept Invitation' })}
            </Button>
          )}
        </div>

        <div className="text-center">
          <Link href="/">
            <Button variant="ghost" size="sm">
              {t('cancel', { defaultValue: 'Cancel' })}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
