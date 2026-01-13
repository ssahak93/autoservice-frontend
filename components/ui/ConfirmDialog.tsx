'use client';

import { AlertTriangle, Info, Trash2 } from 'lucide-react';
import { ReactNode } from 'react';

import { Button } from './Button';
import { Modal } from './Modal';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  icon?: ReactNode;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'info',
  isLoading = false,
  icon,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const variantConfig = {
    danger: {
      icon: icon || <Trash2 className="h-6 w-6 text-error-500" />,
      confirmVariant: 'danger' as const,
      defaultTitle: 'Confirm Delete',
      defaultConfirmText: 'Delete',
    },
    warning: {
      icon: icon || <AlertTriangle className="h-6 w-6 text-warning-500" />,
      confirmVariant: 'danger' as const,
      defaultTitle: 'Confirm Action',
      defaultConfirmText: 'Continue',
    },
    info: {
      icon: icon || <Info className="h-6 w-6 text-primary-500" />,
      confirmVariant: 'primary' as const,
      defaultTitle: 'Confirm',
      defaultConfirmText: 'Confirm',
    },
  };

  const config = variantConfig[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || config.defaultTitle}
      size="sm"
      showCloseButton={true}
    >
      <div className="space-y-4">
        {/* Icon and Message */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">{config.icon}</div>
          <p className="flex-1 text-gray-700 dark:text-gray-300">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            aria-label={cancelText || 'Cancel'}
          >
            {cancelText || 'Cancel'}
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={isLoading}
            aria-label={confirmText || config.defaultConfirmText}
          >
            {confirmText || config.defaultConfirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
