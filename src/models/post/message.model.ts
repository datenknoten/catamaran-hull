/*!
 * @License MIT
 */

import { Post } from './post.model';

/**
 * Message content type
 */
export class Message extends Post {
    public text?: string;

    public constructor() {
        super('message');
    }
}
