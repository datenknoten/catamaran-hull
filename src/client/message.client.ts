/*!
 * @License MIT
 */

import { AbstractClient } from './abstract.client';
import { Message } from '../models/post/message.model';

/**
 * A client for messages
 */
export class MessageClient extends AbstractClient {
    public async fetchPublicFeed(): Promise<Message[]> {

        const query = this
            .database
            .getRepository(Message)
            .createQueryBuilder('m')
            .innerJoinAndSelect('m.author', 'a')
            .leftJoinAndSelect('m.comments', 'c')
            .where('m.createdAt >= :createdAt', {
                createdAt: '2019-01-30',
            })
            .andWhere('m.root_id IS NULL')
            .orderBy('c.createdAt', 'DESC');

        return query.getMany();
    }
}
