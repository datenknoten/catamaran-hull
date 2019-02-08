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
    OneToMany,
    ManyToOne,
    JoinColumn,
    // JoinColumn,
    // ManyToOne,
} from 'typeorm';

import { ContentType } from '../../decorators/content-type.decorator';

import { Post } from './post.model';
import { ObjectFactory } from '../../helpers/object-factory';

const ssbRef = require('ssb-ref');

/**
 * Message content type
 */
@Entity()
@Exclude()
@ContentType()
export class Message extends Post {
    @Column({
        nullable: true,
    })
    @Expose()
    @Transform((_value, obj) => obj.value.content.text)
    public text?: string;

    @OneToMany(
        () => Message,
        (message: Message) => message.root,
    )
    public comments!: Message[];

    @ManyToOne(
        () => Message,
        {
            cascade: [
                'insert',
                'update',
            ],
        },
    )
    @JoinColumn({
        name: 'root_id',
    })
    @Expose()
    @Transform((_value, obj) => {
        if (ssbRef.isMsg(obj.value.content.root)) {
            return ObjectFactory.instance.getPost(obj.value.content.root, Message);
        }
    })
    public root: Message | undefined;

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
