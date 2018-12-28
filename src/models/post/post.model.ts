/*!
 * @License MIT
 * @Author Catamaran Development Team
 */

import { Identity } from '../identity/identity.model';

import { Content } from './content.type';
import { Message } from './message.model';
import { Vote } from './vote.model';

/**
 * The basic content unit available in scuttlebutt
 */
export abstract class Post {
    public id!: string;
    public recievedAt?: Date;
    public createdAt!: Date;
    public author!: Identity;
    public root?: Content;
    public channel?: string;
    public sequence!: number;
    public hash!: string;
    public previousMessageId!: string;
    public readonly messageType: string;
    public isMissing: boolean = true;
    public raw?: unknown;
    public branches: Message[] = [];
    public comments: Message[] = [];
    public lastActivity?: Date;
    public votes: Vote[] = [];


    protected constructor(messageType: string) {
        this.messageType = messageType;
    }
}
