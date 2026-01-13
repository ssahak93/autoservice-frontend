'use client';

import { useState, useCallback } from 'react';

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions | null>(null);

  const confirm = useCallback((opts: ConfirmDialogOptions) => {
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Clear options after animation
    setTimeout(() => setOptions(null), 200);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (options?.onConfirm) {
      await options.onConfirm();
    }
    close();
  }, [options, close]);

  return {
    isOpen,
    options: options || {
      message: '',
      onConfirm: () => {},
    },
    confirm,
    close,
    handleConfirm,
  };
}
