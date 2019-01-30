/*!
 * @License MIT
 */

import { Exclude, Expose, Transform } from 'class-transformer';
import {
    Column,
    Entity,
} from 'typeorm';

import { ContentType } from '../../decorators/content-type.decorator';

import { Content } from './content.type';
import { Post } from './post.model';

/**
 * Message content type
 */
@Entity()
@Exclude()
@ContentType()
export class Vote extends Post {
    public target!: Content;

    @Column()
    @Expose()
    @Transform((_value, obj) => obj.value.content.vote.link)
    public targetId!: string;

    @Column({
        nullable: true,
    })
    @Expose()
    @Transform((_value, obj) => obj.value.content.vote.expression)
    public expression?: string;

    @Column()
    @Expose()
    @Transform((_value, obj) => obj.value.content.vote.value)
    public value!: number;


    public constructor() {
        super('vote');
    }

    /**
     * A check if this a post
     */
    public static isType(data: any) {
        try {
            const contentType = data.value.content.type;
            const vote = data.value.content.vote;

            if (contentType === 'post' && typeof vote === 'object' && vote !== null) {
                return Vote;
            }
        } catch (error) {
            return undefined;
        }
    }
}
