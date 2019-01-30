/*!
 * @License MIT
 */

import { Entity } from 'typeorm';

import { ContentType } from '../../decorators/content-type.decorator';

import { Post } from './post.model';

/**
 * Message content type
 */
@Entity()
@ContentType()
export class Subscription extends Post {
    public constructor() {
        super('contact');
    }

    /**
     * A check if this a post
     */
    public static isType(data: unknown) {
        return Post.isType(data, 'contact', Subscription);
    }
}
