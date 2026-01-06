'use client';

import { Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onChange: (startDate?: string, endDate?: string) => void;
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const t = useTranslations('dashboard.analytics');

  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    onChange(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
  };

  const clearRange = () => {
    onChange(undefined, undefined);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-800">
        <Calendar className="h-4 w-4 text-gray-500" />
        <input
          type="date"
          value={startDate || ''}
          onChange={(e) => onChange(e.target.value || undefined, endDate)}
          className="border-none bg-transparent text-sm text-gray-700 focus:outline-none dark:text-gray-300"
        />
        <span className="text-gray-500">-</span>
        <input
          type="date"
          value={endDate || ''}
          onChange={(e) => onChange(startDate, e.target.value || undefined)}
          className="border-none bg-transparent text-sm text-gray-700 focus:outline-none dark:text-gray-300"
        />
      </div>
      <div className="flex gap-1">
        <Button variant="outline" size="sm" onClick={() => handleQuickSelect(7)}>
          {t('dateRange.week', { defaultValue: '7d' })}
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleQuickSelect(30)}>
          {t('dateRange.month', { defaultValue: '30d' })}
        </Button>
        <Button variant="outline" size="sm" onClick={clearRange}>
          {t('dateRange.clear', { defaultValue: 'Clear' })}
        </Button>
      </div>
    </div>
  );
}
