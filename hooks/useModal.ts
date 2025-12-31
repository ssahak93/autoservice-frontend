import { useEffect, useRef, useState, useCallback } from 'react';

interface UseModalOptions {
  onOpen?: () => void;
  onClose?: () => void;
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  initialFocus?: boolean;
}

interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  closeButtonRef: React.RefObject<HTMLButtonElement>;
}

/**
 * Custom hook for modal management
 *
 * Single Responsibility: Only handles modal state and accessibility
 * Open/Closed: Can be extended with new options without modifying core logic
 */
export function useModal(options: UseModalOptions = {}): UseModalReturn {
  const {
    onOpen,
    onClose,
    closeOnEscape = true,
    closeOnBackdrop: _closeOnBackdrop = true,
    initialFocus = true,
  } = options;

  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const open = useCallback(() => {
    setIsOpen(true);
    onOpen?.();
  }, [onOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && initialFocus && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen, initialFocus]);

  // Keyboard navigation (Escape key)
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, close]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return {
    isOpen,
    open,
    close,
    toggle,
    closeButtonRef,
  };
}
