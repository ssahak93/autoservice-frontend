/**
 * Working Hours Utilities
 *
 * Single Responsibility: Only handles working hours formatting and grouping
 */

export interface WorkingHoursDay {
  open?: string;
  close?: string;
  start?: string; // Backend may use 'start' instead of 'open'
  end?: string; // Backend may use 'end' instead of 'close'
  isOpen?: boolean; // Optional flag
}

export interface WorkingHours {
  [key: string]: WorkingHoursDay | null;
}

export interface GroupedWorkingHours {
  days: string[];
  hours: WorkingHoursDay;
}

/**
 * Groups working hours by time ranges
 * Example: Monday-Friday: 9:00-18:00, Saturday: 10:00-16:00
 */
export function groupWorkingHours(workingHours: WorkingHours): GroupedWorkingHours[] {
  const groups: Map<string, { days: string[]; hours: { open: string; close: string } }> = new Map();

  Object.entries(workingHours).forEach(([day, hours]) => {
    if (!hours) return;

    // Support both formats: {open, close} and {start, end}
    const openTime = hours.open || hours.start;
    const closeTime = hours.close || hours.end;

    // Skip if no valid hours or if isOpen is explicitly false
    if (!openTime || !closeTime || hours.isOpen === false) return;

    const key = `${openTime}-${closeTime}`;
    if (!groups.has(key)) {
      groups.set(key, {
        days: [],
        hours: {
          open: openTime,
          close: closeTime,
        },
      });
    }
    const group = groups.get(key);
    if (group) {
      group.days.push(day);
    }
  });

  return Array.from(groups.values()).map((group) => ({
    days: group.days.sort((a, b) => {
      const dayOrder = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ];
      return dayOrder.indexOf(a.toLowerCase()) - dayOrder.indexOf(b.toLowerCase());
    }),
    hours: group.hours,
  }));
}

/**
 * Formats day name for display
 */
export function formatDayName(day: string, locale: string = 'en'): string {
  const dayNames: Record<string, Record<string, string>> = {
    en: {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
    },
    hy: {
      monday: 'Երկուշաբթի',
      tuesday: 'Երեքշաբթի',
      wednesday: 'Չորեքշաբթի',
      thursday: 'Հինգշաբթի',
      friday: 'Ուրբաթ',
      saturday: 'Շաբաթ',
      sunday: 'Կիրակի',
    },
    ru: {
      monday: 'Понедельник',
      tuesday: 'Вторник',
      wednesday: 'Среда',
      thursday: 'Четверг',
      friday: 'Пятница',
      saturday: 'Суббота',
      sunday: 'Воскресенье',
    },
  };

  const normalizedDay = day.toLowerCase();
  return dayNames[locale]?.[normalizedDay] || dayNames.en[normalizedDay] || day;
}

/**
 * Formats day range for display
 * Example: "Monday - Friday" or "Monday, Tuesday, Wednesday"
 */
export function formatDayRange(days: string[], locale: string = 'en'): string {
  if (days.length === 0) return '';
  if (days.length === 1) return formatDayName(days[0], locale);

  const formattedDays = days.map((day) => formatDayName(day, locale));

  // Check if days are consecutive
  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const sortedDays = days.sort(
    (a, b) => dayOrder.indexOf(a.toLowerCase()) - dayOrder.indexOf(b.toLowerCase())
  );

  let isConsecutive = true;
  for (let i = 1; i < sortedDays.length; i++) {
    const prevIndex = dayOrder.indexOf(sortedDays[i - 1].toLowerCase());
    const currIndex = dayOrder.indexOf(sortedDays[i].toLowerCase());
    if (currIndex !== prevIndex + 1 && !(prevIndex === 6 && currIndex === 0)) {
      isConsecutive = false;
      break;
    }
  }

  if (isConsecutive && days.length > 2) {
    return `${formattedDays[0]} - ${formattedDays[formattedDays.length - 1]}`;
  }

  if (formattedDays.length <= 3) {
    return formattedDays.join(', ');
  }

  return `${formattedDays[0]} - ${formattedDays[formattedDays.length - 1]}`;
}

/**
 * Gets current day name
 */
export function getCurrentDay(): string {
  const dayIndex = new Date().getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return dayNames[dayIndex];
}

/**
 * Checks if service is currently open
 */
export function isCurrentlyOpen(workingHours: WorkingHours): boolean | null {
  const currentDay = getCurrentDay();
  const todayHours = workingHours[currentDay];

  if (!todayHours) {
    return null; // No hours for today
  }

  // Support both formats: {open, close} and {start, end}
  const openTime = todayHours.open || todayHours.start;
  const closeTime = todayHours.close || todayHours.end;

  // If explicitly closed or no valid hours
  if (todayHours.isOpen === false || !openTime || !closeTime) {
    return false;
  }

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return currentTime >= openTime && currentTime <= closeTime;
}
