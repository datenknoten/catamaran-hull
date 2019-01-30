/*!
 * @License MIT
 */

import { Connection } from 'typeorm';

import { ObjectFactory } from '../helpers/object-factory';

import { Client } from './client';

/**
 * A base class for all clients
 */
export abstract class AbstractClient {
    protected sbot: any;
    protected factory: ObjectFactory;
    protected client: Client;
    protected database: Connection;

    public constructor(
        client: Client,
        factory: ObjectFactory,
        sbot: any,
        database: Connection,
    ) {
        this.client = client;
        this.factory = factory;
        this.sbot = sbot;
        this.database = database;
    }
}
