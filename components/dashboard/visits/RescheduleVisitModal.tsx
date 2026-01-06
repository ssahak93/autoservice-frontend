'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { TimePicker } from '@/components/ui/TimePicker';
import { getAnimationVariants } from '@/lib/utils/animations';
import type { Visit } from '@/types';

interface RescheduleVisitModalProps {
  visit: Visit;
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (data: { scheduledDate: string; scheduledTime: string }) => void;
  isLoading?: boolean;
}

export function RescheduleVisitModal({
  visit,
  isOpen,
  onClose,
  onReschedule,
  isLoading = false,
}: RescheduleVisitModalProps) {
  const t = useTranslations('dashboard.visits');
  const variants = getAnimationVariants();
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    visit.scheduledDate ? new Date(visit.scheduledDate) : null
  );
  const [selectedTime, setSelectedTime] = useState(visit.scheduledTime || '');

  const schema = z.object({
    scheduledDate: z
      .string()
      .min(1, t('reschedule.dateRequired', { defaultValue: 'Date is required' })),
    scheduledTime: z
      .string()
      .min(1, t('reschedule.timeRequired', { defaultValue: 'Time is required' }))
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: t('reschedule.timeFormat', { defaultValue: 'Time must be in HH:mm format' }),
      }),
  });

  type FormData = z.infer<typeof schema>;

  const {
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      scheduledDate: visit.scheduledDate,
      scheduledTime: visit.scheduledTime,
    },
  });

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      setValue('scheduledDate', formattedDate, { shouldValidate: true });
    }
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    setValue('scheduledTime', time, { shouldValidate: true });
  };

  const onSubmit = (data: FormData) => {
    onReschedule({
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
    });
    reset();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={variants.fadeIn.initial}
            animate={variants.fadeIn.animate}
            exit={variants.fadeIn.exit}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={variants.modal.initial}
              animate={variants.modal.animate}
              exit={variants.modal.exit}
              className="glass-light w-full max-w-md rounded-xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('reschedule.title', { defaultValue: 'Reschedule Visit' })}
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('reschedule.newDate', { defaultValue: 'New Date' })} *
                  </label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    placeholder={t('reschedule.selectDate', { defaultValue: 'Select date' })}
                    minDate={new Date()}
                  />
                  {errors.scheduledDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.scheduledDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('reschedule.newTime', { defaultValue: 'New Time' })} *
                  </label>
                  <TimePicker
                    value={selectedTime}
                    onChange={handleTimeChange}
                    placeholder={t('reschedule.selectTime', { defaultValue: 'Select time' })}
                  />
                  {errors.scheduledTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.scheduledTime.message}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={onClose} fullWidth>
                    {t('cancel', { defaultValue: 'Cancel' })}
                  </Button>
                  <Button type="submit" isLoading={isLoading} fullWidth>
                    {t('reschedule.confirm', { defaultValue: 'Reschedule' })}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
