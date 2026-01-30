'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { memo } from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

import { BlockedServiceWarning } from './BlockedServiceWarning';
import { ServiceActionsMenu } from './ServiceActionsMenu';
import { ServiceAvatar } from './ServiceAvatar';
import { ServiceStatusBadge } from './ServiceStatusBadge';

interface Service {
  id: string;
  name: string;
  serviceType: 'individual' | 'company';
  avatarFile?: { fileUrl: string } | null;
  hasProfile: boolean;
  isApproved?: boolean;
  rejectionReason?: string | null;
  isBlocked?: boolean;
  blockedReason?: string | null;
}

interface ServiceCardProps {
  service: Service;
  index: number;
  variant: 'incomplete' | 'complete';
  isSelected: boolean;
  getServiceTypeLabel: (type: 'individual' | 'company') => string;
  onSelect: (serviceId: string) => void;
  onDelete: (serviceId: string, hasProfile: boolean) => void;
  deleting?: boolean;
}

/**
 * Reusable service card component for both incomplete and complete services
 * Memoized to prevent unnecessary re-renders
 */
export const ServiceCard = memo(function ServiceCard({
  service,
  index,
  variant,
  isSelected,
  getServiceTypeLabel,
  onSelect,
  onDelete,
  deleting = false,
}: ServiceCardProps) {
  const t = useTranslations('myService');
  const tCommon = useTranslations('common');

  const isIncomplete = variant === 'incomplete';
  const borderColor = isIncomplete
    ? isSelected
      ? 'border-primary-500'
      : 'border-amber-200 dark:border-amber-800'
    : isSelected
      ? 'border-primary-500'
      : 'border-gray-200 dark:border-gray-700';

  const bgColor = isIncomplete
    ? isSelected
      ? 'bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/10'
      : 'bg-white dark:bg-gray-800'
    : isSelected
      ? 'bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/10'
      : 'bg-white dark:bg-gray-800';

  const hoverGradient = isIncomplete
    ? 'from-amber-50/0 to-amber-100/0 group-hover:from-amber-50/50 group-hover:to-amber-100/30 dark:from-amber-900/0 dark:to-amber-800/0 dark:group-hover:from-amber-900/20 dark:group-hover:to-amber-800/10'
    : 'from-primary-50/0 to-primary-100/0 group-hover:from-primary-50/50 group-hover:to-primary-100/30 dark:from-primary-900/0 dark:to-primary-800/0 dark:group-hover:from-primary-900/20 dark:group-hover:to-primary-800/10';

  const getStatusBadges = () => {
    if (isIncomplete) {
      return <ServiceStatusBadge status="missing" />;
    }

    const badges = [<ServiceStatusBadge key="complete" status="complete" />];

    if (service.hasProfile && service.isApproved) {
      badges.push(<ServiceStatusBadge key="approved" status="approved" delay={0.1} />);
    } else if (service.hasProfile && service.rejectionReason) {
      badges.push(<ServiceStatusBadge key="rejected" status="rejected" delay={0.1} />);
    } else if (service.hasProfile && !service.isApproved && !service.rejectionReason) {
      badges.push(<ServiceStatusBadge key="pending" status="pending" delay={0.1} />);
    }

    return badges;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-xl border-2 p-5 transition-all duration-300',
        borderColor,
        bgColor,
        isSelected && 'shadow-lg ring-2 ring-primary-200 dark:ring-primary-800',
        !isSelected && 'shadow-md hover:shadow-xl',
        service.isBlocked && 'opacity-75'
      )}
      onClick={() => onSelect(service.id)}
    >
      {/* Gradient overlay on hover */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br transition-all duration-300',
          hoverGradient
        )}
      />

      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute right-3 top-3"
        >
          <div className="rounded-full bg-primary-500 p-1.5">
            <CheckCircle2 className="h-4 w-4 text-white" />
          </div>
        </motion.div>
      )}

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            {/* Avatar */}
            <ServiceAvatar
              avatarFile={service.avatarFile}
              name={service.name}
              isApproved={service.isApproved}
              variant={isIncomplete ? 'amber' : 'primary'}
            />

            {/* Service Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-bold text-gray-900 dark:text-white">
                    {service.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {getServiceTypeLabel(service.serviceType)}
                  </p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="mt-2 flex flex-wrap items-center gap-2">{getStatusBadges()}</div>

              {/* Blocked Warning */}
              {service.isBlocked && <BlockedServiceWarning blockedReason={service.blockedReason} />}
            </div>
          </div>

          {/* Actions */}
          {isIncomplete ? (
            <div className="flex flex-shrink-0 flex-col gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(service.id);
                }}
                disabled={service.isBlocked}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                {t('servicesList.createProfile', { defaultValue: 'Create Profile' })}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(service.id, false);
                }}
                disabled={deleting}
                className="flex items-center gap-2 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
                {tCommon('delete', { defaultValue: 'Delete' })}
              </Button>
            </div>
          ) : (
            <ServiceActionsMenu
              serviceId={service.id}
              hasProfile={service.hasProfile}
              isBlocked={service.isBlocked || false}
              onManage={() => onSelect(service.id)}
              onDelete={() => onDelete(service.id, true)}
              deleting={deleting}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
});
