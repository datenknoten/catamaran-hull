/*!
 * @License MIT
 */

import { Exclude, Transform, Expose } from 'class-transformer';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

import { Identity } from '../identity/identity.model';

import { Post } from './post.model';
import { ContentType } from '../../decorators/content-type.decorator';

/**
 * Message content type
 */
@Entity()
@Exclude()
@ContentType()
export class IdentityDescription extends Post {
    @ManyToOne(
        () => Identity,
        {
            cascade: [
                'insert',
                'update',
            ],
        },
    )
    @JoinColumn({
        name: 'target_id',
    })
    @Expose()
    @Transform((_value, obj) => new Identity(obj.value.content.about))
    public target!: Identity;

    @Column({
        nullable: true,
    })
    @Expose()
    @Transform((_value, obj) => obj.value.content.name)
    public name?: string;

    @Column({
        nullable: true,
    })
    @Expose()
    @Transform((_value, obj) => {
        if (typeof obj.value.content.image === 'string') {
            return obj.value.content.image;
        } else if (typeof obj.value.content.image === 'object' &&
                   obj.value.content.image !== null &&
                 typeof obj.value.content.image.link === 'string') {
            return obj.value.content.image.link;
        }
    })
    public image?: string;

    public constructor() {
        super('identiy/about');
    }

    /**
     * A check if this a post
     */
    public static isType(data: any) {
        try {
            const contentType = data.value.content.type;
            const content = data.value.content;
            const target = content.about;

            if (contentType === 'about' && (
                typeof content.name === 'string' ||
                    (typeof content.image === 'string') || (
                        typeof content.image === 'object' &&
                            typeof content.image.link === 'string')
                    ) &&
                ((typeof target === 'string') && target.startsWith('@'))) {
                return IdentityDescription;
            }
        } catch (error) {
            return undefined;
        }
    }
}
