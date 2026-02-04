/**
 * Date formatting utilities
 *
 * Provides consistent date formatting across the application with locale support.
 * All date formatting should use these utilities to avoid code duplication.
 */

import type { Locale } from 'date-fns';
import { format } from 'date-fns/format';
import { enUS } from 'date-fns/locale/en-US';
import { hy } from 'date-fns/locale/hy';
import { ru } from 'date-fns/locale/ru';
import { parseISO } from 'date-fns/parseISO';

import type { Locale as AppLocale } from '@/i18n/routing';

/**
 * Get date-fns locale object based on app locale
 */
export function getDateFnsLocale(locale: AppLocale | string): Locale {
  switch (locale) {
    case 'ru':
      return ru;
    case 'hy':
      return hy;
    case 'en':
    default:
      return enUS;
  }
}

/**
 * Parse date string to Date object
 * Tries parseISO first, then falls back to new Date()
 */
function parseDate(dateStr: string | Date | null | undefined): Date | null {
  if (!dateStr) return null;

  if (dateStr instanceof Date) {
    return isNaN(dateStr.getTime()) ? null : dateStr;
  }

  try {
    // Try parseISO first for ISO dates
    const isoDate = parseISO(dateStr);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }
  } catch {
    // Fallback to new Date()
  }

  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * Format date in standard format (d MMMM yyyy for ru/hy, MMMM d, yyyy for en)
 * This is the default format used throughout the application for displaying dates
 */
export function formatDate(
  dateStr: string | Date | null | undefined,
  locale: AppLocale | string
): string {
  const date = parseDate(dateStr);
  if (!date) return '';

  const dateFnsLocale = getDateFnsLocale(locale);

  try {
    switch (locale) {
      case 'ru':
      case 'hy':
        return format(date, 'd MMMM yyyy', { locale: dateFnsLocale });
      case 'en':
      default:
        return format(date, 'MMMM d, yyyy', { locale: dateFnsLocale });
    }
  } catch {
    return dateStr instanceof Date ? date.toLocaleDateString() : String(dateStr || '');
  }
}

/**
 * Format date and time together
 */
export function formatDateTime(
  dateStr: string | Date | null | undefined,
  timeStr: string | null | undefined,
  locale: AppLocale | string
): string {
  if (!dateStr) return '';

  const dateFormatted = formatDate(dateStr, locale);
  if (!timeStr) return dateFormatted;

  return `${dateFormatted} ${timeStr}`;
}

/**
 * Format date in short format (MMM d, yyyy)
 */
export function formatDateShort(
  dateStr: string | Date | null | undefined,
  locale: AppLocale | string
): string {
  const date = parseDate(dateStr);
  if (!date) return '';

  const dateFnsLocale = getDateFnsLocale(locale);

  try {
    return format(date, 'MMM d, yyyy', { locale: dateFnsLocale });
  } catch {
    return dateStr instanceof Date ? date.toLocaleDateString() : String(dateStr || '');
  }
}

/**
 * Format date and time in short format (MMM d, yyyy HH:mm)
 * If timeStr is provided, it will be used; otherwise, time will be extracted from dateStr.
 */
export function formatDateTimeShort(
  dateStr: string | Date | null | undefined,
  locale: AppLocale | string,
  timeStr?: string | null | undefined
): string {
  const date = parseDate(dateStr);
  if (!date) return '';

  const dateFnsLocale = getDateFnsLocale(locale);

  try {
    const dateFormatted = format(date, 'MMM d', { locale: dateFnsLocale });
    const timeFormatted = timeStr || format(date, 'HH:mm');
    return `${dateFormatted}, ${timeFormatted}`;
  } catch {
    return dateStr instanceof Date ? date.toLocaleString() : String(dateStr || '');
  }
}

/**
 * Format date in full format with time (PPp - e.g., "Jan 30, 2026, 1:56 PM")
 */
export function formatDateFull(
  dateStr: string | Date | null | undefined,
  locale: AppLocale | string
): string {
  const date = parseDate(dateStr);
  if (!date) return '';

  const dateFnsLocale = getDateFnsLocale(locale);

  try {
    return format(date, 'PPp', { locale: dateFnsLocale });
  } catch {
    return dateStr instanceof Date ? date.toLocaleString() : String(dateStr || '');
  }
}

/**
 * Format date in ISO format (yyyy-MM-dd) for form inputs
 */
export function formatDateISO(date: Date | null | undefined): string {
  if (!date || isNaN(date.getTime())) return '';

  try {
    return format(date, 'yyyy-MM-dd');
  } catch {
    return '';
  }
}

/**
 * Format time only (HH:mm format).
 * @param dateStr - Date string or Date object
 * @returns Formatted time string (e.g., "14:30")
 */
export function formatTime(dateStr: string | Date | undefined): string {
  if (!dateStr) return '';
  try {
    let date: Date;
    if (typeof dateStr === 'string') {
      try {
        date = parseISO(dateStr);
      } catch {
        date = new Date(dateStr);
      }
    } else {
      date = dateStr;
    }

    if (isNaN(date.getTime())) return String(dateStr);

    return format(date, 'HH:mm');
  } catch {
    return String(dateStr);
  }
}

/**
 * Format time with seconds (HH:mm:ss format).
 * @param dateStr - Date string or Date object
 * @returns Formatted time string with seconds (e.g., "14:30:45")
 */
export function formatTimeWithSeconds(dateStr: string | Date | undefined): string {
  if (!dateStr) return '';
  try {
    let date: Date;
    if (typeof dateStr === 'string') {
      try {
        date = parseISO(dateStr);
      } catch {
        date = new Date(dateStr);
      }
    } else {
      date = dateStr;
    }

    if (isNaN(date.getTime())) return String(dateStr);

    return format(date, 'HH:mm:ss');
  } catch {
    return String(dateStr);
  }
}

/**
 * Format date for display in date picker (with month names)
 */
export function formatDateForPicker(date: Date | null, locale: AppLocale | string): string {
  if (!date) return '';

  const dateFnsLocale = getDateFnsLocale(locale);

  try {
    switch (locale) {
      case 'ru':
      case 'hy':
        return format(date, 'd MMMM yyyy', { locale: dateFnsLocale });
      case 'en':
      default:
        return format(date, 'MMMM d, yyyy', { locale: dateFnsLocale });
    }
  } catch {
    return date.toLocaleDateString();
  }
}

/**
 * Format date in a simple format (dd MMMM yyyy) for message separators
 */
export function formatDateSimple(
  dateStr: string | Date | null | undefined,
  locale: AppLocale | string
): string {
  const date = parseDate(dateStr);
  if (!date) return '';

  const dateFnsLocale = getDateFnsLocale(locale);

  try {
    return format(date, 'dd MMMM yyyy', { locale: dateFnsLocale });
  } catch {
    return dateStr instanceof Date ? date.toLocaleDateString() : String(dateStr || '');
  }
}
