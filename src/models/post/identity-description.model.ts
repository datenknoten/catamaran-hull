/*!
 * @License MIT
 */

import { Identity } from '../identity/identity.model';

import { Post } from './post.model';

/**
 * Message content type
 */
export class IdentityDescription extends Post {
    public target!: Identity;

    public constructor() {
        super('identiy/about');
    }
}
