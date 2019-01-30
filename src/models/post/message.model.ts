/*!
 * @License MIT
 */

import {
    Exclude,
    Expose,
    Transform,
} from 'class-transformer';
import {
    Column,
    Entity,
} from 'typeorm';

import { ContentType } from '../../decorators/content-type.decorator';

import { Post } from './post.model';

/**
 * Message content type
 */
@Entity()
@Exclude()
@ContentType()
export class Message extends Post {
    @Column()
    @Expose()
    @Transform((_value, obj) => obj.value.content.text)
    public text?: string;

    public constructor() {
        super('message');
    }

    /**
     * A check if this a post
     */
    public static isType(data: any) {
        try {
            const contentType = data.value.content.type;
            const text = data.value.content.text;

            if (contentType === 'post' && typeof text === 'string') {
                return Message;
            }
        } catch (error) {
            return undefined;
        }
    }
}
