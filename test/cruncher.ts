/*!
 * @License MIT
 */

import { Client } from '../src';

(async function() {
    try {
        const client = await Client.create();

        client.cruncher.crunch();
    } catch (error) {
        console.dir('Faild to run command');
        console.dir(error);
        process.exit(-1);
    }
})();
