/*!
 * @License MIT
 */

import { DateTime } from 'luxon';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
} from 'typeorm';

import { Post } from '../post.model';

import { Gathering } from './gathering.model';

/**
 * Metadata for a gathering
 */
@Entity()
export class GatheringMetadata extends Post {
    @Column()
    public title?: string;

    @Column()
    public content?: string;

    @Column({
        name: 'start_date',
        type: 'datetime',
    })
    public startDate!: DateTime;

    @ManyToOne(
        () => Gathering,
    )
    @JoinColumn({
        name: 'gathering_id',
    })
    public gathering!: Gathering;

    public constructor() {
        super('gathering/about');
    }
}
