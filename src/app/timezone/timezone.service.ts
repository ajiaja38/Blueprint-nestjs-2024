import { Injectable } from '@nestjs/common';
import * as moment from 'moment';

@Injectable()
export class TimezoneService {
  getTimeZone(): string {
    const now: Date = new Date();
    now.setHours(now.getHours() + 7);

    return now.toISOString();
  }

  birthDateStringToDateUtc(birthDate: Date): Date {
    return moment.utc(birthDate, 'YYYY-MM-DD').toDate();
  }
}
