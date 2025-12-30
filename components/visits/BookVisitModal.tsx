'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateVisit } from '@/hooks/useVisits';
import { getAnimationVariants } from '@/lib/utils/animations';
import { cn } from '@/lib/utils/cn';

const bookVisitSchema = z.object({
  preferredDate: z.string().min(1, 'Date is required'),
  preferredTime: z.string().min(1, 'Time is required'),
  description: z.string().optional(),
});

type BookVisitFormData = z.infer<typeof bookVisitSchema>;

interface BookVisitModalProps {
  serviceId: string;
  serviceName: string;
}

export function BookVisitModal({ serviceId, serviceName }: BookVisitModalProps) {
  const t = useTranslations('visits');
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: createVisit, isPending } = useCreateVisit();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const variants = getAnimationVariants();

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookVisitFormData>({
    resolver: zodResolver(bookVisitSchema),
  });

  const onSubmit = (data: BookVisitFormData) => {
    createVisit(
      {
        autoServiceProfileId: serviceId,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        description: data.description,
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          reset();
        },
      }
    );
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Book Visit</Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              {...variants.fadeIn}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                {...variants.modal}
                className="glass-light w-full max-w-md rounded-2xl p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="book-visit-title"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 id="book-visit-title" className="font-display text-2xl font-bold">
                      {t('bookVisit', { defaultValue: 'Book a Visit' })}
                    </h2>
                    <p className="text-sm text-neutral-600">{serviceName}</p>
                  </div>
                  <button
                    ref={closeButtonRef}
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg p-2 transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label={t('close', { defaultValue: 'Close' })}
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input
                    label={t('preferredDate')}
                    type="date"
                    error={errors.preferredDate?.message}
                    {...register('preferredDate')}
                  />

                  <Input
                    label={t('preferredTime')}
                    type="time"
                    error={errors.preferredTime?.message}
                    {...register('preferredTime')}
                  />

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                      {t('description')} (Optional)
                    </label>
                    <textarea
                      className={cn(
                        'w-full rounded-lg border-2 border-neutral-300 px-4 py-2 outline-none transition-colors focus:border-primary-500',
                        errors.description ? 'border-error-500' : ''
                      )}
                      rows={4}
                      placeholder="Describe what service you need..."
                      {...register('description')}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-error-500">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1" isLoading={isPending}>
                      Book Visit
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
