/**
 * Time formatting utilities
 *
 * Provides consistent time formatting across the application.
 * All time formatting should use these utilities to avoid code duplication.
 */

import { format } from 'date-fns/format';
import { isToday } from 'date-fns/isToday';
import { isYesterday } from 'date-fns/isYesterday';
import { parseISO } from 'date-fns/parseISO';

import { formatTime, formatTimeWithSeconds } from './date';

/**
 * Format message read time with smart formatting based on when it was read.
 * - If read within 1 minute of sending: shows seconds (HH:mm:ss)
 * - If read today: shows time only (HH:mm)
 * - If read yesterday: shows "Yesterday at HH:mm"
 * - Otherwise: shows full date and time (dd.MM.yyyy HH:mm)
 *
 * @param readAt - When the message was read
 * @param sentAt - When the message was sent
 * @param t - Translation function for "yesterdayAt"
 * @returns Formatted read time string or null if not read
 */
export function formatMessageReadTime(
  readAt: string | Date | null | undefined,
  sentAt: string | Date,
  t?: (key: string, options?: { time?: string; defaultValue?: string }) => string
): string | null {
  if (!readAt) return null;

  try {
    const readTime = typeof readAt === 'string' ? parseISO(readAt) : readAt;
    const sentTime = typeof sentAt === 'string' ? parseISO(sentAt) : sentAt;

    if (isNaN(readTime.getTime()) || isNaN(sentTime.getTime())) {
      return null;
    }

    // If read time is same as sent time (or very close), show with seconds
    const timeDiff = readTime.getTime() - sentTime.getTime();
    const isSameMinute = Math.abs(timeDiff) < 60000; // Less than 1 minute difference

    if (isSameMinute) {
      return formatTimeWithSeconds(readAt);
    }

    if (isToday(readTime)) {
      return formatTime(readAt);
    }

    if (isYesterday(readTime)) {
      const time = formatTime(readAt);
      if (t) {
        return t('yesterdayAt', {
          time,
          defaultValue: `Yesterday at ${time}`,
        });
      }
      return `Yesterday at ${time}`;
    }

    // Full date and time for older messages
    return format(readTime, 'dd.MM.yyyy HH:mm');
  } catch {
    return null;
  }
}

/**
 * Format message sent time (always HH:mm format).
 * @param sentAt - When the message was sent
 * @returns Formatted time string (e.g., "14:30")
 */
export function formatMessageSentTime(sentAt: string | Date): string {
  return formatTime(sentAt);
}
