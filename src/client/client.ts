/*!
 * @License MIT
 */

import { ObjectFactory } from '../helpers/object-factory';

import { IdentityClient } from './identity.client';
import { MessageClient } from './message.client';
import { CruncherClient } from './cruncher.client';
import { Connection, createConnection } from 'typeorm';


export class Client {

    public identity: IdentityClient;
    public message: MessageClient;
    public cruncher: CruncherClient;
    private sbot: any;

    private factory: ObjectFactory;


    private constructor(
        connection: Connection,
        sbot?: any,
    ) {
        this.sbot = sbot;
        this.factory = new ObjectFactory();
        this.identity = new IdentityClient(
            this,
            this.factory,
            this.sbot,
            connection,
        );
        this.message = new MessageClient(
            this,
            this.factory,
            this.sbot,
            connection,
        );
        this.cruncher = new CruncherClient(
            this,
            this.factory,
            this.sbot,
            connection,
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
            customRequire('ssb-client')((error: unknown, _client: unknown) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(_client);
            });
        }));

        const connection = await createConnection();

        const client = new Client(connection, ssbClient);

        await client.init();

        return client;
    }

    private async init() {
        await this.identity.init();
    }
}
