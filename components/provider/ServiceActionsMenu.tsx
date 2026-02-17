'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, MoreVertical, Settings, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { useRouter } from '@/i18n/routing';
import { getTransition } from '@/lib/utils/animations';

interface ServiceActionsMenuProps {
  serviceId: string;
  hasProfile: boolean;
  isBlocked: boolean;
  onManage: () => void;
  onDelete: () => void;
  onViewPublic?: () => void;
  deleting?: boolean;
}

/**
 * Dropdown menu for service actions
 */
export function ServiceActionsMenu({
  serviceId,
  hasProfile,
  isBlocked,
  onManage,
  onDelete,
  onViewPublic,
  deleting = false,
}: ServiceActionsMenuProps) {
  const t = useTranslations('myService');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleViewPublic = () => {
    if (onViewPublic) {
      onViewPublic();
    } else {
      router.push(`/services/${serviceId}`);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative flex-shrink-0" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="h-8 w-8 p-0"
        disabled={isBlocked}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={getTransition(0.15)}
            className="absolute right-0 top-10 z-50 w-48 rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onManage();
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Settings className="h-4 w-4" />
                {t('servicesList.manage', { defaultValue: 'Manage' })}
              </button>
              {hasProfile && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewPublic();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t('servicesList.viewPublic', { defaultValue: 'View Public Profile' })}
                </button>
              )}
              <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setIsOpen(false);
                }}
                disabled={deleting}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
                {tCommon('delete', { defaultValue: 'Delete' })}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
