/*!
 * @License MIT
 */

import {
    Column,
    Entity,
} from 'typeorm';

import { Post } from './post.model';


/**
 * Message content type
 */
@Entity()
export class Message extends Post {
    @Column()
    public text?: string;

    public constructor() {
        super('message');
    }
}
