'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { TimePicker } from '@/components/ui/TimePicker';
import { availabilityService } from '@/lib/services/availability.service';
import { getAnimationVariants } from '@/lib/utils/animations';
import { formatDateISO } from '@/lib/utils/date';
import type { Visit } from '@/types';

interface AcceptVisitModalProps {
  visit: Visit;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (data: { confirmedDate?: string; confirmedTime?: string; notes?: string }) => void;
  isLoading?: boolean;
}

export function AcceptVisitModal({
  visit,
  isOpen,
  onClose,
  onAccept,
  isLoading = false,
}: AcceptVisitModalProps) {
  const t = useTranslations('dashboard.visits');
  const variants = getAnimationVariants();

  const schema = z.object({
    confirmedDate: z.string().optional(),
    confirmedTime: z
      .string()
      .optional()
      .refine((val) => !val || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val), {
        message: t('accept.invalidTime', { defaultValue: 'Time must be in HH:mm format' }),
      }),
    notes: z
      .string()
      .max(
        500,
        t('accept.notesMaxLength', { defaultValue: 'Notes must be less than 500 characters' })
      )
      .optional(),
  });

  type FormData = z.infer<typeof schema>;

  // Calculate today's date (start of day)
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  // Set initial date: use visit date if it's today or in the future, otherwise use today
  const initialDate = useMemo(() => {
    if (!visit.scheduledDate) return today;
    const visitDate = new Date(visit.scheduledDate);
    visitDate.setHours(0, 0, 0, 0);
    return visitDate >= today ? visitDate : today;
  }, [visit.scheduledDate, today]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);

  // Get profile ID for availability check
  const profileId = visit.autoServiceProfileId;

  // Calculate date range for availability (next 60 days)
  const startDate = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return formatDateISO(date);
  }, []);

  const endDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 60);
    return formatDateISO(date);
  }, []);

  // Fetch availability if profile ID is available
  const { data: availability } = useQuery({
    queryKey: ['availability', profileId, startDate, endDate],
    queryFn: () =>
      profileId ? availabilityService.getAvailability(profileId, startDate, endDate) : null,
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Calculate initial form values
  const initialFormValues = useMemo(() => {
    const visitDate = visit.scheduledDate ? new Date(visit.scheduledDate) : null;
    let dateStr: string | undefined;
    if (visitDate) {
      visitDate.setHours(0, 0, 0, 0);
      const dateToUse = visitDate >= today ? visitDate : today;
      dateStr = formatDateISO(dateToUse);
    } else {
      dateStr = formatDateISO(today);
    }
    return {
      confirmedDate: dateStr,
      confirmedTime: visit.scheduledTime,
      notes: '',
    };
  }, [visit.scheduledDate, visit.scheduledTime, today]);

  const { register, handleSubmit, setValue, watch, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialFormValues,
  });

  // Update selectedDate when visit changes
  useEffect(() => {
    const visitDate = visit.scheduledDate ? new Date(visit.scheduledDate) : null;
    if (visitDate) {
      visitDate.setHours(0, 0, 0, 0);
      const dateToUse = visitDate >= today ? visitDate : today;
      setSelectedDate(dateToUse);
      const dateStr = formatDateISO(dateToUse);
      setValue('confirmedDate', dateStr, { shouldValidate: false });
    } else {
      setSelectedDate(today);
      const dateStr = formatDateISO(today);
      setValue('confirmedDate', dateStr, { shouldValidate: false });
    }
    if (visit.scheduledTime) {
      setValue('confirmedTime', visit.scheduledTime, { shouldValidate: false });
    }
  }, [visit.scheduledDate, visit.scheduledTime, setValue, today]);

  const onSubmit = (data: FormData) => {
    onAccept({
      confirmedDate: data.confirmedDate,
      confirmedTime: data.confirmedTime,
      notes: data.notes,
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
                  {t('accept.title', { defaultValue: 'Accept Visit' })}
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
                    {t('accept.confirmedDate', { defaultValue: 'Confirmed Date (optional)' })}
                  </label>
                  <DatePicker
                    value={selectedDate}
                    onChange={(date) => {
                      setSelectedDate(date);
                      setValue('confirmedDate', date ? formatDateISO(date) : undefined, {
                        shouldValidate: true,
                      });
                    }}
                    minDate={today}
                    placeholder={t('accept.selectDate', { defaultValue: 'Select date' })}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('accept.confirmedTime', { defaultValue: 'Confirmed Time (optional)' })}
                  </label>
                  <TimePicker
                    value={watch('confirmedTime') || ''}
                    onChange={(time) => setValue('confirmedTime', time)}
                    placeholder={t('accept.selectTime', { defaultValue: 'Select time' })}
                    availableTimes={
                      availability && typeof availability !== 'string' && selectedDate
                        ? availability.availableSlots.find(
                            (slot) => slot.date === formatDateISO(selectedDate)
                          )?.times || []
                        : []
                    }
                    selectedDate={selectedDate}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('accept.notes', { defaultValue: 'Notes (optional)' })}
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder={t('accept.notesPlaceholder', { defaultValue: 'Add any notes...' })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={onClose} fullWidth>
                    {t('cancel', { defaultValue: 'Cancel' })}
                  </Button>
                  <Button type="submit" isLoading={isLoading} fullWidth>
                    {t('accept.confirm', { defaultValue: 'Accept Visit' })}
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
