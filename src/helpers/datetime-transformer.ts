/*!
 * @License MIT
 */

import { DateTime } from 'luxon';
import { ValueTransformer } from 'typeorm';

/**
 * Support conversion from db to luxon and vice versa
 */
export class DateTimeTransformer implements ValueTransformer {
    public from(value: string): DateTime {
        return DateTime.fromSQL(value);
    }

    public to(value: DateTime): string {
        return value.toSQL();
    }
}
