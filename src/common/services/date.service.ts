import { Injectable } from '@nestjs/common';
import { DateTime, Settings } from 'luxon';

@Injectable()
export class DateService {
  constructor() {
    // Set default zone to France
    Settings.defaultZone = 'Europe/Paris';
    Settings.defaultLocale = 'fr';
  }

  /**
   * Returns current date time in Europe/Paris
   */
  now(): DateTime {
    return DateTime.now().setZone('Europe/Paris');
  }

  /**
   * Returns current date as ISO string (e.g. 2023-12-25)
   */
  toISODate(): string {
    return this.now().toISODate();
  }

  /**
   * Returns current ISO string with timezone (e.g. 2023-12-25T14:00:00.000+01:00)
   */
  toISOString(): string {
    return this.now().toISO();
  }

  /**
   * Parse a date string and return DateTime in Europe/Paris
   */
  fromISO(date: string): DateTime {
    return DateTime.fromISO(date, { zone: 'Europe/Paris' });
  }

  /**
   * Format a date
   */
  format(date: string | Date | DateTime, format: string = 'dd/MM/yyyy HH:mm'): string {
    if (date instanceof Date) {
      return DateTime.fromJSDate(date).setZone('Europe/Paris').toFormat(format);
    }
    if (typeof date === 'string') {
      return DateTime.fromISO(date).setZone('Europe/Paris').toFormat(format);
    }
    return date.setZone('Europe/Paris').toFormat(format);
  }
}
