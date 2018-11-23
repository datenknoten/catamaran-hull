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

        if (process.versions.hasOwnProperty('electron')) {
            ssbClient = await (new Promise((resolve, reject) => {
                window.require('ssb-client')((error: any, client: any) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(client);
                })
            }));
        } else {
            ssbClient = await (new Promise((resolve, reject) => {
                require('ssb-client')((error: any, client: any) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(client);
                })
            }));
        }

        const client = new Client(ssbClient);

        await client.init();

        return client;
    }

    private async init() {
        await this.identity.init();
    }
}
