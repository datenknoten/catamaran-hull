/*!
 * @License MIT
 */

import { Exclude } from 'class-transformer';
import { Entity } from 'typeorm';

import { Post } from './post.model';

/**
 * Message content type
 */
@Entity()
@Exclude()
export class EncryptedContent extends Post {
    public constructor() {
        super('encrypted');
    }
}
