'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, X, XCircle, AlertCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

import { useUIStore } from '@/stores/uiStore';

const toastIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const toastColors = {
  success: 'bg-success-500',
  error: 'bg-error-500',
  warning: 'bg-warning-500',
  info: 'bg-primary-500',
};

export function Toast() {
  const { toast, hideToast } = useUIStore();

  useEffect(() => {
    if (toast?.isVisible) {
      const timer = setTimeout(() => {
        hideToast();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  if (!toast) return null;

  const Icon = toastIcons[toast.type];

  return (
    <AnimatePresence>
      {toast.isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed right-4 top-4 z-50"
        >
          <div
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-white shadow-xl ${toastColors[toast.type]}`}
          >
            <Icon className="h-5 w-5" />
            <p className="flex-1">{toast.message}</p>
            <button
              onClick={hideToast}
              className="transition-opacity hover:opacity-70"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
