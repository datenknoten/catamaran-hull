import * as util from 'util';

import { ObjectFactory } from '../helpers/object-factory';

import { IdentityClient } from './identity.client';
import { MessageClient } from './message.client';


export class Client {
    private sbot: any;

    public identity: IdentityClient;
    public message: MessageClient;

    private factory: ObjectFactory;



    private constructor(sbot: any) {
        this.sbot = sbot;
        this.factory = new ObjectFactory();
        this.identity = new IdentityClient(
            this,
            this.factory,
            this.sbot,
        );
        this.message = new MessageClient(
            this,
            this.factory,
            this.sbot,
        );
    }

    public static async create() {
        const ssbClient = util.promisify(require('ssb-client'));

        const client = new Client(await ssbClient());

        await client.init();

        return client;
    }

    private async init() {
        await this.identity.init();
    }
}
