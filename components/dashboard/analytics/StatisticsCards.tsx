'use client';

import { BarChart3, Calendar, CheckCircle2, Clock, XCircle, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { DashboardStatistics } from '@/hooks/useDashboard';

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

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </p>
              </div>
              <div className={`rounded-full p-3 ${card.color} bg-opacity-10`}>
                <Icon className={`h-6 w-6 ${card.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
