'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Clock, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { useUpdateProfile } from '@/hooks/useProfileMutations';
import type { AutoServiceProfile } from '@/lib/services/auto-service-profile.service';

interface WorkingHoursEditorProps {
  profile: AutoServiceProfile;
}

interface DaySchedule {
  start: string;
  end: string;
  isOpen: boolean;
}

interface WorkingHoursForm {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

const DAYS = [
  { key: 'monday', labelKey: 'monday' },
  { key: 'tuesday', labelKey: 'tuesday' },
  { key: 'wednesday', labelKey: 'wednesday' },
  { key: 'thursday', labelKey: 'thursday' },
  { key: 'friday', labelKey: 'friday' },
  { key: 'saturday', labelKey: 'saturday' },
  { key: 'sunday', labelKey: 'sunday' },
] as const;

const defaultDaySchedule: DaySchedule = {
  start: '09:00',
  end: '18:00',
  isOpen: true,
};

export function WorkingHoursEditor({ profile }: WorkingHoursEditorProps) {
  const t = useTranslations('myService.availability');

  // Initialize form with existing working hours or defaults
  const getInitialValues = (): WorkingHoursForm => {
    const workingHours = profile.workingHours || {};
    const result: WorkingHoursForm = {
      monday: defaultDaySchedule,
      tuesday: defaultDaySchedule,
      wednesday: defaultDaySchedule,
      thursday: defaultDaySchedule,
      friday: defaultDaySchedule,
      saturday: defaultDaySchedule,
      sunday: defaultDaySchedule,
    };

    DAYS.forEach(({ key }) => {
      const dayData = workingHours[key] as DaySchedule | undefined;
      if (dayData) {
        result[key] = {
          start: dayData.start || defaultDaySchedule.start,
          end: dayData.end || defaultDaySchedule.end,
          isOpen: dayData.isOpen !== undefined ? dayData.isOpen : true,
        };
      }
    });

    return result;
  };

  const schema = z.object({
    monday: z.object({
      start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isOpen: z.boolean(),
    }),
    tuesday: z.object({
      start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isOpen: z.boolean(),
    }),
    wednesday: z.object({
      start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isOpen: z.boolean(),
    }),
    thursday: z.object({
      start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isOpen: z.boolean(),
    }),
    friday: z.object({
      start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isOpen: z.boolean(),
    }),
    saturday: z.object({
      start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isOpen: z.boolean(),
    }),
    sunday: z.object({
      start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isOpen: z.boolean(),
    }),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: getInitialValues(),
  });

  // Use custom hook for update mutation (SOLID - Single Responsibility)
  const updateMutation = useUpdateProfile();

  const onSubmit = (data: FormData) => {
    // Convert form data to working hours format
    const workingHours: Record<string, DaySchedule> = {};
    DAYS.forEach(({ key }) => {
      workingHours[key] = data[key];
    });

    updateMutation.mutate({ workingHours });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6 flex items-center gap-3">
          <Clock className="h-6 w-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('workingHours', { defaultValue: 'Working Hours' })}
          </h3>
        </div>

        <div className="space-y-4">
          {DAYS.map(({ key, labelKey }) => {
            const dayData = watch(key);
            const isOpen = dayData?.isOpen ?? true;

            return (
              <div
                key={key}
                className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t(`days.${labelKey}`, {
                      defaultValue: labelKey.charAt(0).toUpperCase() + labelKey.slice(1),
                    })}
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register(`${key}.isOpen`)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('open', { defaultValue: 'Open' })}
                  </span>
                </div>

                {isOpen && (
                  <>
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                        {t('startTime', { defaultValue: 'Start' })}
                      </label>
                      <input
                        type="time"
                        {...register(`${key}.start`)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        disabled={!isOpen}
                      />
                      {errors[key]?.start && (
                        <p className="mt-1 text-xs text-red-600">{errors[key]?.start?.message}</p>
                      )}
                    </div>

                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                        {t('endTime', { defaultValue: 'End' })}
                      </label>
                      <input
                        type="time"
                        {...register(`${key}.end`)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        disabled={!isOpen}
                      />
                      {errors[key]?.end && (
                        <p className="mt-1 text-xs text-red-600">{errors[key]?.end?.message}</p>
                      )}
                    </div>
                  </>
                )}

                {!isOpen && (
                  <div className="flex-1 text-sm text-gray-500 dark:text-gray-400">
                    {t('closed', { defaultValue: 'Closed' })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="submit"
            disabled={isSubmitting || updateMutation.isPending}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {t('save', { defaultValue: 'Save Changes' })}
          </Button>
        </div>
      </div>
    </form>
  );
}
