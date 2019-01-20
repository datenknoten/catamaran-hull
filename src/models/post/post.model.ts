/*!
 * @License MIT
 * @Author Catamaran Development Team
 */

import {
    Column,
    PrimaryColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

import { Identity } from '../identity/identity.model';

import { Content } from './content.type';
import { Message } from './message.model';
import { Vote } from './vote.model';

/**
 * The basic content unit available in scuttlebutt
 */
export abstract class Post {
    @PrimaryColumn()
    public id!: string;

    @Column()
    public recievedAt?: Date;

    @Column()
    public createdAt!: Date;

    // @Column()
    @ManyToOne(
        () => Identity,
    )
    @JoinColumn({
        name: 'author_id',
    })
    public author!: Identity;

    // @Column()
    public root?: Content;

    @Column()
    public channel?: string;

    @Column()
    public sequence!: number;

    @Column()
    public hash!: string;

    @Column()
    public previousMessageId!: string;

    @Column()
    public readonly messageType: string;

    @Column()
    public isMissing: boolean = true;

    @Column({
        type: 'simple-json',
    })
    public raw?: unknown;

    public branches: Message[] = [];
    public comments: Message[] = [];
    public lastActivity?: Date;
    public votes: Vote[] = [];


    protected constructor(messageType: string) {
        this.messageType = messageType;
    }
}
