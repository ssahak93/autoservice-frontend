'use client';

import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, ShieldCheck, XCircle, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { memo } from 'react';

type ServiceStatus = 'complete' | 'missing' | 'approved' | 'pending' | 'rejected';
type VisitStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

interface ServiceStatusBadgeProps {
  status: ServiceStatus | VisitStatus;
  delay?: number;
  variant?: 'service' | 'visit';
}

/**
 * Reusable status badge component for services and visits
 */
export const ServiceStatusBadge = memo(function ServiceStatusBadge({
  status,
  delay = 0,
  variant = 'service',
}: ServiceStatusBadgeProps) {
  const t = useTranslations('myService');
  const tVisits = useTranslations('dashboard.visits');

  const serviceStatusConfig: Record<
    ServiceStatus,
    { icon: typeof CheckCircle2; text: string; className: string }
  > = {
    complete: {
      icon: CheckCircle2,
      text: t('servicesList.profileComplete', { defaultValue: 'Profile complete' }),
      className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    },
    missing: {
      icon: AlertCircle,
      text: t('servicesList.profileMissing', { defaultValue: 'Profile not created' }),
      className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    },
    approved: {
      icon: ShieldCheck,
      text: t('servicesList.approved', { defaultValue: 'Approved' }),
      className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    },
    pending: {
      icon: AlertCircle,
      text: t('servicesList.pendingApproval', { defaultValue: 'Pending Approval' }),
      className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    },
    rejected: {
      icon: AlertCircle,
      text: t('servicesList.rejected', { defaultValue: 'Rejected' }),
      className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    },
  };

  const visitStatusConfig: Record<
    VisitStatus,
    { icon: typeof CheckCircle2; text: string; className: string }
  > = {
    pending: {
      icon: Clock,
      text: tVisits('status.pending', { defaultValue: 'Pending' }),
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    },
    confirmed: {
      icon: CheckCircle2,
      text: tVisits('status.confirmed', { defaultValue: 'Confirmed' }),
      className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    },
    in_progress: {
      icon: Clock,
      text: tVisits('status.in_progress', { defaultValue: 'In Progress' }),
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    },
    completed: {
      icon: CheckCircle2,
      text: tVisits('status.completed', { defaultValue: 'Completed' }),
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    },
    cancelled: {
      icon: XCircle,
      text: tVisits('status.cancelled', { defaultValue: 'Cancelled' }),
      className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    },
    no_show: {
      icon: XCircle,
      text: tVisits('status.no_show', { defaultValue: 'No Show' }),
      className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    },
  };

  const config =
    variant === 'visit' && visitStatusConfig[status as VisitStatus]
      ? visitStatusConfig[status as VisitStatus]
      : serviceStatusConfig[status as ServiceStatus];

  const Icon = config.icon;

  return (
    <motion.span
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ delay }}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.text}
    </motion.span>
  );
});
