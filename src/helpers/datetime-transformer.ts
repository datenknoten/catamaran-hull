/*!
 * @License MIT
 */

import { DateTime } from 'luxon';
import { ValueTransformer } from 'typeorm';

/**
 * Support conversion from db to luxon and vice versa
 */
export class DateTimeTransformer implements ValueTransformer {
    public from(value: Date): DateTime {
        return DateTime.fromJSDate(value);
    }

    public to(value?: DateTime): string | null {
        if (typeof value === 'undefined' || value === null) {
            return null;
        } else {
            return value.toSQL();
        }
    }
}
