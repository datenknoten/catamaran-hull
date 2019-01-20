/*!
 * @License MIT
 * @Author Catamaran Development Team
 */

import { Entity, OneToMany } from 'typeorm';

import { Post } from '../post.model';

import { GatheringAttendee } from './gathering-attendee.model';
import { GatheringMetadata } from './gathering-metadata.model';


/**
 * Represents a gathering in code
 */
@Entity()
export class Gathering extends Post {
    /**
     * The attendees of a gathering
     */
    @OneToMany(
        () => GatheringAttendee,
        (row: GatheringAttendee) => row.gathering,
    )
    public attendees: GatheringAttendee[];

    /**
     * The metadata for the gathering
     */
    @OneToMany(
        () => GatheringMetadata,
        (row: GatheringMetadata) => row.gathering,
    )
    public metadata: GatheringMetadata[];

    public constructor() {
        super('gathering');
    }

}
