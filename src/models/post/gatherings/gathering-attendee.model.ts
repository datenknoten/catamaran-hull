/*!
 * @License MIT
 */

import {
    Entity,
    JoinColumn,
    ManyToOne,
} from 'typeorm';

import { Post } from '../post.model';

import { Identity } from '../../identity/identity.model';
import { Gathering } from './gathering.model';

/**
 * An attendee for a gathering
 */
@Entity()
export class GatheringAttendee extends Post {

    @ManyToOne(
        () => Identity,
    )
    @JoinColumn({
        name: 'attendee_id',
    })
    public identity!: Identity;

    @ManyToOne(
        () => Gathering,
    )
    @JoinColumn({
        name: 'gathering_id',
    })
    public gathering!: Gathering;

    public constructor() {
        super('gathering/attendee');
    }
}
