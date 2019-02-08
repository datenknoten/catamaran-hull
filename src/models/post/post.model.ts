/*!
 * @License MIT
 * @Author Catamaran Development Team
 */

import {
    Exclude,
    Expose,
    Transform,
} from 'class-transformer';
import { DateTime } from 'luxon';
import {
    Column,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
} from 'typeorm';

import { DateTimeTransformer } from '../../helpers/datetime-transformer';
import { Identity } from '../identity/identity.model';

import { ContentConstructor } from './content.type';
// import { Message } from './message.model';
import { Vote } from './vote.model';
import { ObjectFactory } from '../../helpers/object-factory';

const ssbRef = require('ssb-ref');

/**
 * The basic content unit available in scuttlebutt
 */
@Exclude()
export abstract class Post {
    @PrimaryColumn()
    @Expose({
        name: 'key',
    })
    public id!: string;

    @Column({
        type: 'datetime',
        name: 'recieved_at',
        nullable: true,
        transformer: new DateTimeTransformer(),
    })
    @Expose({
        name: 'timestamp',
    })
    @Transform((value) => DateTime.fromMillis(value))
    public recievedAt?: DateTime;

    @Column({
        type: 'datetime',
        name: 'created_at',
        nullable: true,
        transformer: new DateTimeTransformer(),
    })
    @Expose()
    @Transform((_value, obj) => DateTime.fromMillis(obj.value.timestamp))
    public createdAt!: DateTime;

    @ManyToOne(
        () => Identity,
        {
            cascade: [
                'insert',
                'update',
            ],
            nullable: true,
        },
    )
    @JoinColumn({
        name: 'author_id',
    })
    @Expose()
    @Transform((_value, obj) => ObjectFactory.instance.getIdentity(obj.value.author))
    public author!: Identity;

    @Column({
        nullable: true,
    })
    @Expose()
    @Transform((_value, obj) => obj.value.content.channel, { toClassOnly: true })
    public channel?: string;

    @Column({
        nullable: true,
    })
    @Expose()
    @Transform((_value, obj) => obj.value.sequence, { toClassOnly: true })
    public sequence!: number;

    @Column({
        nullable: true,
        name: 'root_id',
    })
    @Index()
    @Expose()
    @Transform((_value, obj) => {
        if (ssbRef.isMsg(obj.value.content.root)) {
            return obj.value.content.root;
        }
    })
    public rootId?: string;

    @Column({
        nullable: true,
    })
    @Expose()
    @Transform((_value, obj) => obj.value.hash, { toClassOnly: true })
    public hash!: string;

    @Column({
        nullable: true,
    })
    @Expose()
    @Transform((_value, obj) => obj.value.previous, { toClassOnly: true })
    public previousMessageId?: string;

    @Column()
    public readonly messageType: string;

    @Column()
    public isMissing: boolean = true;

    // @Column({
    //     type: 'simple-json',
    // })
    @Expose()
    @Transform((_value, obj) => obj, { toClassOnly: true })
    public raw?: unknown;

    // public branches: Message[] = [];
    public lastActivity?: Date;
    public votes: Vote[] = [];


    protected constructor(messageType: string) {
        this.messageType = messageType;
    }

    /**
     * Generic method to extract the content type of a data object
     */
    protected static isType(
        data: any,
        expected: string,
        type: ContentConstructor,
    ) {
        try {
            const contentType = data.value.content.type;

            if (contentType === expected) {
                return type;
            }
        } catch (error) {
            return undefined;
        }
    }
}
