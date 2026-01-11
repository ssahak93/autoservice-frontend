'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
// Import only needed functions from date-fns for tree shaking
import { format } from 'date-fns/format';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { TimePicker } from '@/components/ui/TimePicker';
import { useModal } from '@/hooks/useModal';
import { useCreateVisit, useUpdateVisit } from '@/hooks/useVisits';
import { availabilityService } from '@/lib/services/availability.service';
import { getAnimationVariants } from '@/lib/utils/animations';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

// Schema will be created inside component to use translations
const createBookVisitSchema = (t: (key: string, options?: { defaultValue?: string }) => string) => {
  const dateRequiredMsg = t('dateRequired', { defaultValue: 'Date is required' });
  const timeRequiredMsg = t('timeRequired', { defaultValue: 'Time is required' });
  return z.object({
    scheduledDate: z.string().min(1, dateRequiredMsg),
    scheduledTime: z
      .string()
      .min(1, timeRequiredMsg)
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Time must be in HH:mm format',
      }),
    problemDescription: z.string().optional(),
  });
};

type BookVisitFormData = z.infer<ReturnType<typeof createBookVisitSchema>>;

interface BookVisitModalProps {
  serviceId?: string;
  serviceName?: string;
  // Edit mode props
  visitId?: string;
  visit?: {
    scheduledDate?: string;
    scheduledTime?: string;
    problemDescription?: string;
    autoServiceId?: string;
    autoServiceProfileId?: string;
  };
  mode?: 'create' | 'edit';
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

/**
 * BookVisitModal Component
 *
 * Single Responsibility: Only handles visit booking/editing form UI
 * Dependency Inversion: Uses useModal hook for modal management
 * Supports both create and edit modes
 */
export function BookVisitModal({
  serviceId,
  serviceName,
  visitId,
  visit,
  mode = 'create',
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onSuccess: externalOnSuccess,
}: BookVisitModalProps) {
  const t = useTranslations('visits');
  const { mutate: createVisit, isPending: isCreating } = useCreateVisit();
  const { mutate: updateVisit, isPending: isUpdating } = useUpdateVisit();
  const { isOpen: internalIsOpen, open, close: internalClose, closeButtonRef } = useModal();
  const variants = getAnimationVariants();
  const bookVisitSchema = createBookVisitSchema(t);
  const { user: _user } = useAuthStore();
  const { showToast } = useUIStore();

  // Use external isOpen/onClose in edit mode, internal in create mode
  const isEditMode = mode === 'edit';
  const isOpen = isEditMode ? (externalIsOpen ?? false) : internalIsOpen;
  const close = isEditMode ? externalOnClose || (() => {}) : internalClose;
  const isPending = isEditMode ? isUpdating : isCreating;

  // Initialize form with visit data in edit mode
  const initialDate = visit?.scheduledDate ? new Date(visit.scheduledDate) : null;
  const initialTime = visit?.scheduledTime || '';

  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);
  const [selectedTime, setSelectedTime] = useState<string>(initialTime);

  // Get serviceId from visit in edit mode
  // API expects profile ID, not autoService ID
  // const actualServiceId = isEditMode
  //   ? visit?.autoServiceProfileId || visit?.autoServiceId
  //   : serviceId;

  // Profile ID for availability API (must be profile ID, not autoService ID)
  const profileIdForAvailability = isEditMode ? visit?.autoServiceProfileId : serviceId;

  // Check if this is user's own service (only in create mode)
  // Use useMemo to prevent hydration mismatch
  const startDate = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const endDate = useMemo(
    () => format(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    []
  );

  const { data: availability, isLoading: isLoadingAvailability } = useQuery({
    queryKey: ['availability', profileIdForAvailability, startDate, endDate],
    queryFn: () =>
      availabilityService.getAvailability(profileIdForAvailability!, startDate, endDate),
    enabled: !!profileIdForAvailability, // Only check if we have profile ID
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const isOwnService = availability === 'OWN_SERVICE';

  // Handle opening modal - check if own service first (only in create mode)
  const handleOpen = () => {
    if (isEditMode) {
      // In edit mode, modal is controlled externally
      return;
    }

    // Wait for availability check to complete
    if (isLoadingAvailability) {
      return; // Don't open modal while checking
    }

    if (isOwnService) {
      // Show error message instead of opening modal
      showToast(
        t('cannotBookOwnService', { defaultValue: 'You cannot book a visit to your own service' }),
        'error'
      );
      return;
    }
    open();
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<BookVisitFormData>({
    resolver: zodResolver(bookVisitSchema),
    defaultValues: {
      scheduledDate: visit?.scheduledDate || '',
      scheduledTime: visit?.scheduledTime || '',
      problemDescription: visit?.problemDescription || '',
    },
  });

  // Update form when visit data changes (for edit mode)
  useEffect(() => {
    if (isEditMode && visit) {
      if (visit.scheduledDate) {
        const date = new Date(visit.scheduledDate);
        setSelectedDate(date);
        setValue('scheduledDate', format(date, 'yyyy-MM-dd'));
      }
      if (visit.scheduledTime) {
        setSelectedTime(visit.scheduledTime);
        setValue('scheduledTime', visit.scheduledTime);
      }
      if (visit.problemDescription) {
        setValue('problemDescription', visit.problemDescription);
      }
    }
  }, [isEditMode, visit, setValue]);

  const onSubmit = (data: BookVisitFormData) => {
    if (isEditMode) {
      // Edit mode - update existing visit
      if (!visitId) {
        showToast(t('failedToUpdate', { defaultValue: 'Visit ID is required' }), 'error');
        return;
      }

      updateVisit(
        {
          id: visitId,
          data: {
            scheduledDate: data.scheduledDate,
            scheduledTime: data.scheduledTime,
            problemDescription: data.problemDescription,
          },
        },
        {
          onSuccess: () => {
            close();
            reset();
            setSelectedDate(null);
            setSelectedTime('');
            if (externalOnSuccess) {
              externalOnSuccess();
            }
          },
        }
      );
    } else {
      // Create mode - book new visit
      // Double check before submitting
      if (isOwnService) {
        showToast(
          t('cannotBookOwnService', {
            defaultValue: 'You cannot book a visit to your own service',
          }),
          'error'
        );
        return;
      }

      if (!serviceId) {
        showToast(t('failedToBook', { defaultValue: 'Service ID is required' }), 'error');
        return;
      }

      createVisit(
        {
          autoServiceId: serviceId,
          scheduledDate: data.scheduledDate,
          scheduledTime: data.scheduledTime,
          problemDescription: data.problemDescription,
        },
        {
          onSuccess: () => {
            close();
            reset();
            setSelectedDate(null);
            setSelectedTime('');
          },
          onError: (error: Error) => {
            // Error message is already shown by useCreateVisit hook
            // But we can also check if it's the own service error
            if (
              error.message.includes('own service') ||
              error.message.includes('собственный сервис')
            ) {
              close(); // Close modal if it's own service error
            }
          },
        }
      );
    }
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      setValue('scheduledDate', formattedDate, { shouldValidate: true });
    } else {
      setValue('scheduledDate', '', { shouldValidate: true });
    }
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    setValue('scheduledTime', time, { shouldValidate: true });
  };

  // Filter out past dates
  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  // Get service name for display
  const displayServiceName = isEditMode
    ? serviceName || visit?.autoServiceId || 'Service'
    : serviceName;

  return (
    <>
      {/* Only show button in create mode */}
      {!isEditMode && (
        <Button onClick={handleOpen} disabled={isLoadingAvailability}>
          {isLoadingAvailability
            ? t('loading', { defaultValue: 'Loading...' })
            : t('bookVisit', { defaultValue: 'Book Visit' })}
        </Button>
      )}

      <AnimatePresence>
        {isOpen && (!isEditMode ? !isOwnService : true) && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={variants.fadeIn.initial}
              animate={variants.fadeIn.animate}
              exit={variants.fadeIn.exit}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={close}
              aria-hidden="true"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={variants.modal.initial}
                animate={variants.modal.animate}
                exit={variants.modal.exit}
                className="glass-light w-full max-w-md rounded-xl p-4 shadow-2xl sm:rounded-2xl sm:p-6"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="book-visit-title"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 id="book-visit-title" className="font-display text-2xl font-bold">
                      {isEditMode
                        ? t('editVisit', { defaultValue: 'Edit Visit' })
                        : t('bookVisit', { defaultValue: 'Book a Visit' })}
                    </h2>
                    {displayServiceName && (
                      <p className="text-sm text-neutral-600">{displayServiceName}</p>
                    )}
                  </div>
                  <button
                    ref={!isEditMode ? closeButtonRef : undefined}
                    onClick={close}
                    className="rounded-lg p-2 transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label={t('close', { defaultValue: 'Close' })}
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Date Picker */}
                  <Controller
                    name="scheduledDate"
                    control={control}
                    render={() => (
                      <DatePicker
                        value={selectedDate}
                        onChange={handleDateChange}
                        label={t('preferredDate')}
                        placeholder={t('preferredDate', { defaultValue: 'Select date' })}
                        error={errors.scheduledDate?.message}
                        required
                        minDate={minDate}
                        autoServiceId={profileIdForAvailability}
                        showAvailability={!!profileIdForAvailability}
                      />
                    )}
                  />

                  {/* Time Picker */}
                  <Controller
                    name="scheduledTime"
                    control={control}
                    render={() => {
                      // Get available times for selected date
                      const availableTimesForDate =
                        availability && typeof availability !== 'string' && selectedDate
                          ? availability.availableSlots.find(
                              (slot) => slot.date === format(selectedDate, 'yyyy-MM-dd')
                            )?.times || []
                          : [];

                      return (
                        <TimePicker
                          value={selectedTime}
                          onChange={handleTimeChange}
                          label={t('preferredTime')}
                          placeholder={t('preferredTime', { defaultValue: 'Select time' })}
                          error={errors.scheduledTime?.message}
                          required
                          availableTimes={availableTimesForDate}
                          selectedDate={selectedDate}
                        />
                      );
                    }}
                  />

                  {/* Problem Description */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                      {t('description')}{' '}
                      <span className="text-neutral-400">
                        ({t('optional', { defaultValue: 'Optional' })})
                      </span>
                    </label>
                    <Controller
                      name="problemDescription"
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          className="w-full resize-none rounded-lg border-2 border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                          rows={4}
                          placeholder={t('description', {
                            defaultValue: 'Describe what service you need...',
                          })}
                        />
                      )}
                    />
                    {errors.problemDescription && (
                      <p className="mt-1 text-sm text-error-500">
                        {errors.problemDescription.message}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={close}>
                      {t('cancel', { defaultValue: 'Cancel' })}
                    </Button>
                    <Button type="submit" className="flex-1" isLoading={isPending}>
                      {isEditMode
                        ? t('edit', { defaultValue: 'Save Changes' })
                        : t('bookVisit', { defaultValue: 'Book Visit' })}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
