/*!
 * @License MIT
 */

import { Content } from './content.type';
import { Post } from './post.model';

/**
 * Message content type
 */
export class Vote extends Post {
    public target!: Content;
    public expression!: string;
    public value!: number;


    public constructor() {
        super('vote');
    }
}
