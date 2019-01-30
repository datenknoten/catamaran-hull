/*!
 * @License MIT
 */

import {
    Entity,
    JoinColumn,
    ManyToOne,
} from 'typeorm';

import { BookClub } from './bookclub.model';
import { Post } from './post.model';

/**
 * Message content type
 */
@Entity()
export class BookClubDescription extends Post {
    @ManyToOne(
        () => BookClub,
    )
    @JoinColumn({
        name: 'gathering_id',
    })
    public gathering!: BookClub;

    public constructor() {
        super('bookclub/description');
    }
}
