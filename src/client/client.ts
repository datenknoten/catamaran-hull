/*!
 * @License MIT
 */

import { ObjectFactory } from '../helpers/object-factory';

import { IdentityClient } from './identity.client';
import { MessageClient } from './message.client';


export class Client {

    public identity: IdentityClient;
    public message: MessageClient;
    private sbot: any;

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
        // if (process.versions.hasOwnProperty('electron')) {
        //     customRequire = window.require;
        // } else {
            // Need this hack to escape webpack, which will try to evaluate
            // require('ssb-client') and will utterly fail with that.
            customRequire = eval(`require`);
        //}

        ssbClient = await (new Promise<unknown>((resolve, reject) => {
            customRequire('ssb-client')({
                host: '2003:e0:6f19:cc00:3d71:fdfb:7ea5:9a6e',
            }, (error: unknown, _client: unknown) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(_client);
            });
        }));

        const client = new Client(ssbClient);

        await client.init();

        return client;
    }

    private async init() {
        await this.identity.init();
    }
}
