import { ObjectFactory } from '../helpers/object-factory';

import { IdentityClient } from './identity.client';
import { MessageClient } from './message.client';


export class Client {
    private sbot: any;

    public identity: IdentityClient;
    public message: MessageClient;

    private factory: ObjectFactory;



    private constructor(sbot?: any) {
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
        let ssbClient;

        let customRequire: NodeRequire;
        if (process.versions.hasOwnProperty('electron')) {
            customRequire = window.require;
        } else {
            // Need this hack to escape webpack, which will try to evaluate
            // require('ssb-client') and will utterly fail with that.
            customRequire = eval(`require`);
        }

        ssbClient = await (new Promise((resolve, reject) => {
            customRequire('ssb-client')((error: any, client: any) => {
                if (error) {
                    return reject(error);
                }
                resolve(client);
            })
        }));

        const client = new Client(ssbClient);

        await client.init();

        return client;
    }

    private async init() {
        await this.identity.init();
    }
}
