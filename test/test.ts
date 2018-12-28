import { Client, Gathering } from "../src";

(async function() {
    try {
        const client = await Client.create();

        const obs = client.message.fetchPublicFeed();

        obs.subscribe(data => {
            if (data instanceof Gathering) {
                console.dir({
                    data: data.metadata,
                }, { depth: 2 });
            }
        });
        // process.exit(0);
    } catch(error) {
        console.dir('Faild to run command');
        console.dir(error);
        process.exit(-1);
    }
})()
