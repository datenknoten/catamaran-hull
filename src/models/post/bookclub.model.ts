/*!
 * @License MIT
 */

import { Entity } from 'typeorm';

import { Post } from './post.model';

/**
 * Message content type
 */
@Entity()
export class BookClub extends Post {
    public constructor() {
        super('bookclub');
    }
}
