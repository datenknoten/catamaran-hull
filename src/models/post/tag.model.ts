/*!
 * @License MIT
 */

import { Post } from './post.model';

/**
 * Message content type
 */
export class Tag extends Post {
    public constructor() {
        super('tag');
    }
}
