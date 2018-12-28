/*!
 * @License MIT
 * @Author Catamaran Development Team
 */

import { Post } from '../post.model';

import { GatheringAttendee } from './gathering-attendee.model';
import { GatheringMetadata } from './gathering-metadata.model';


/**
 * Represents a gathering in code
 */
export class Gathering extends Post {
    public constructor() {
        super('gathering');
    }

    public attendees: GatheringAttendee[] = [];
    public metadata: GatheringMetadata[] = [];
}
