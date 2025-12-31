'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type ReactNode } from 'react';

interface FiltersModalProps {
  trigger: ReactNode;
  children: ReactNode;
  title?: string;
}

/**
 * FiltersModal Component
 *
 * Single Responsibility: Only handles modal display for filters on mobile
 * Open/Closed: Can be extended with new features without modifying core logic
 */
export function FiltersModal({ trigger, children, title }: FiltersModalProps) {
  const t = useTranslations('services');
  const modalRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Trigger Button - Only visible on mobile */}
      <div className="lg:hidden" onClick={open}>
        {trigger}
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/50 lg:hidden"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={title || t('filters')}
        >
          {/* Modal Content */}
          <div
            ref={modalRef}
            className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-4">
              <h2 className="font-display text-lg font-semibold">{title || t('filters')}</h2>
              <button
                onClick={close}
                className="rounded-full p-2 text-neutral-600 transition-colors hover:bg-neutral-100"
                aria-label={t('close', { defaultValue: 'Close' })}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="overflow-y-auto px-4 pb-6">{children}</div>
          </div>
        </div>
      )}

      {/* Desktop View - Always visible */}
      <div className="hidden lg:block">{children}</div>
    </>
  );
}
