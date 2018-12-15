import { Client } from "../src";

(async function() {
    try {
        const client = await Client.create();

        const obs = client.message.fetchPublicFeed();

        obs.subscribe(data => {
            console.dir({
                data,
            }, { depth: 0 });
        });
        // process.exit(0);
    } catch(error) {
        console.dir('Faild to run command');
        console.dir(error);
        process.exit(-1);
    }
})()
