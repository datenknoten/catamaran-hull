/*!
 * @License MIT
 */

import { Post } from '../post.model';

import { Identity } from '../../identity/identity.model';

/**
 * An attendee for a gathering
 */
export class GatheringAttendee extends Post {
    public constructor() {
        super('gathering/attendee');
    }

    public identity!: Identity;
}
