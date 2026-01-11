'use client';

import { motion } from 'framer-motion';
import { BarChart3, Calendar, CheckCircle2, Clock, XCircle, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { DashboardStatistics } from '@/hooks/useDashboard';
import { getAnimationVariants, getTransition } from '@/lib/utils/animations';

interface StatisticsCardsProps {
  statistics: DashboardStatistics;
}

export function StatisticsCards({ statistics }: StatisticsCardsProps) {
  const t = useTranslations('dashboard.analytics');

  const cards = [
    {
      title: t('stats.total', { defaultValue: 'Total Visits' }),
      value: statistics.total,
      icon: BarChart3,
      color: 'bg-blue-500',
    },
    {
      title: t('stats.pending', { defaultValue: 'Pending' }),
      value: statistics.pending,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: t('stats.confirmed', { defaultValue: 'Confirmed' }),
      value: statistics.confirmed,
      icon: Calendar,
      color: 'bg-green-500',
    },
    {
      title: t('stats.completed', { defaultValue: 'Completed' }),
      value: statistics.completed,
      icon: CheckCircle2,
      color: 'bg-emerald-500',
    },
    {
      title: t('stats.cancelled', { defaultValue: 'Cancelled' }),
      value: statistics.cancelled,
      icon: XCircle,
      color: 'bg-red-500',
    },
    {
      title: t('stats.today', { defaultValue: "Today's Visits" }),
      value: statistics.today,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  const variants = getAnimationVariants();
  const transition = getTransition(0.2);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            variants={variants.slideUp}
            initial="initial"
            animate="animate"
            transition={{ ...transition, delay: index * 0.05 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </p>
              </div>
              <motion.div
                className={`rounded-full p-3 ${card.color} bg-opacity-10`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={transition}
              >
                <Icon className={`h-6 w-6 ${card.color.replace('bg-', 'text-')}`} />
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
