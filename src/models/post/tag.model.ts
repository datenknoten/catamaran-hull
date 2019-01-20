/*!
 * @License MIT
 */

import { Entity } from 'typeorm';

import { Post } from './post.model';

/**
 * Message content type
 */
@Entity()
export class Tag extends Post {
    public constructor() {
        super('tag');
    }
}
