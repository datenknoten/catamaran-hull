/*!
 * @License MIT
 */

import { Entity } from 'typeorm';

import { Post } from './post.model';

/**
 * Message content type
 */
@Entity()
export class Flag extends Post {
    public constructor() {
        super('flag');
    }
}
