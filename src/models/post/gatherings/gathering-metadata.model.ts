/*!
 * @License MIT
 */

import { DateTime } from 'luxon';

import { Post } from '../post.model';

/**
 * Metadata for a gathering
 */
export class GatheringMetadata extends Post {
    public constructor() {
        super('gathering/about');
    }

    public title?: string;
    public content?: string;
    public startDate!: DateTime;
}
