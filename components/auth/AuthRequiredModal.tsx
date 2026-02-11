'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';
import { useRouter } from '@/i18n/routing';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
}

export function AuthRequiredModal({ isOpen, onClose, redirectUrl }: AuthRequiredModalProps) {
  const t = useTranslations('auth');
  const router = useRouter();

  const handleLogin = () => {
    if (redirectUrl && typeof window !== 'undefined') {
      sessionStorage.setItem('redirectAfterLogin', redirectUrl);
    }
    router.push('/auth/login');
    onClose();
  };

  const handleRegister = () => {
    if (redirectUrl && typeof window !== 'undefined') {
      sessionStorage.setItem('redirectAfterLogin', redirectUrl);
    }
    router.push('/auth/register');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="glass-light w-full max-w-md rounded-xl p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-required-title"
        >
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2
              id="auth-required-title"
              className="text-2xl font-bold text-neutral-900 dark:text-white"
            >
              {t('authRequired', { defaultValue: 'Authentication Required' })}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label={t('close', { defaultValue: 'Close' })}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <p className="text-neutral-700 dark:text-neutral-300">
              {t('authRequiredMessage', {
                defaultValue:
                  'You need to be logged in to book a visit. Please login or create an account to continue.',
              })}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button variant="primary" onClick={handleLogin} className="flex-1">
              {t('login', { defaultValue: 'Login' })}
            </Button>
            <Button variant="outline" onClick={handleRegister} className="flex-1">
              {t('register', { defaultValue: 'Register' })}
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center">
            <button
              onClick={onClose}
              className="text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              {t('cancel', { defaultValue: 'Cancel' })}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
