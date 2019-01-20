/*!
 * @License MIT
 */

import {
    Column,
    Entity,
} from 'typeorm';

import { Content } from './content.type';
import { Post } from './post.model';

/**
 * Message content type
 */
@Entity()
export class Vote extends Post {
    public target!: Content;

    @Column()
    public targetId!: string;

    @Column()
    public expression!: string;

    @Column()
    public value!: number;


    public constructor() {
        super('vote');
    }
}
