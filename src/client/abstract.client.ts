import { ObjectFactory } from '../helpers/object-factory';

import { Client } from './client';

export abstract class AbstractClient {
    protected sbot: any;
    protected factory: ObjectFactory;
    protected client: Client;

    public constructor(
        client: Client,
        factory: ObjectFactory,
        sbot: any,
    ) {
        this.client = client;
        this.factory = factory;
        this.sbot = sbot;
    }
}
