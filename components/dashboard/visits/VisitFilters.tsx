'use client';

import { Filter } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { cn } from '@/lib/utils/cn';

interface VisitFiltersProps {
  filters: {
    status?: string;
    date?: string;
    page?: number;
    limit?: number;
  };
  onFilterChange: (filters: {
    status?: string;
    date?: string;
    page?: number;
    limit?: number;
  }) => void;
}

const statusOptions = [
  { value: '', label: 'all' },
  { value: 'pending', label: 'pending' },
  { value: 'confirmed', label: 'confirmed' },
  { value: 'completed', label: 'completed' },
  { value: 'cancelled', label: 'cancelled' },
] as const;

export function VisitFilters({ filters, onFilterChange }: VisitFiltersProps) {
  const t = useTranslations('dashboard.visits');
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    filters.date ? new Date(filters.date) : null
  );

  const handleStatusChange = (status: string) => {
    onFilterChange({ ...filters, status: status || undefined, page: 1 });
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    onFilterChange({
      ...filters,
      date: date ? date.toISOString().split('T')[0] : undefined,
      page: 1,
    });
  };

  const clearFilters = () => {
    setSelectedDate(null);
    onFilterChange({ page: 1, limit: filters.limit });
  };

  const hasActiveFilters = filters.status || filters.date;

  return (
    <div className="glass-light rounded-xl p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Filter className="h-5 w-5 text-primary-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('filters.title', { defaultValue: 'Filters' })}
        </h3>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        {/* Status Filter */}
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('filters.status', { defaultValue: 'Status' })}
          </label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                  filters.status === option.value || (!filters.status && option.value === '')
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                )}
              >
                {t(`status.${option.label}`, { defaultValue: option.label })}
              </button>
            ))}
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('filters.date', { defaultValue: 'Date' })}
          </label>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            placeholder={t('filters.selectDate', { defaultValue: 'Select date' })}
            className="w-full"
          />
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters} size="md">
            {t('filters.clear', { defaultValue: 'Clear Filters' })}
          </Button>
        )}
      </div>
    </div>
  );
}
