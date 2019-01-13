import { pullToObserveable } from '../src/helpers/pull-to-observeable';
// import  * as util from 'util';

// import {
//     take,
// } from 'rxjs/operators';

const stats = {};

function isNested(data: any) {
    return typeof data === 'object' &&
        data !== null &&
        !Array.isArray(data);
}

function isCalculateable(data: any) {
    return typeof data === 'string' ||
        typeof data === 'number' ||
        typeof data === 'boolean' ||
        Array.isArray(data);
}

function calculateStats(data: any, stats: any) {
    const keys = Object.keys(data);
    for (const key of keys) {
        if (isCalculateable(data[key])) {
            if (typeof stats[key] === 'undefined') {
                stats[key] = 1;
            } else if (isNested(stats[key])) {
                stats[key]['<root>']++;
            } else {
                stats[key]++;
            }
        } else if (isNested(data[key])) {
            if (!isNested(stats[key])) {
                if (typeof stats[key] === 'number') {
                    stats[key] = {
                        '<root>': stats[key],
                    };
                } else {
                    stats[key] = {};
                }
            }
            calculateStats(data[key], stats[key]);
        }
    }
}

(async function(){
    const ssbClient = await (new Promise<any>((resolve, reject) => {
        require('ssb-client')({
            host: '2003:e0:6f19:cc00:3d71:fdfb:7ea5:9a6e',
        }, (error: any, _client: any) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(_client);
        });
    }));

    const feed = ssbClient.createFeedStream();

    const obs = pullToObserveable(feed);

    obs
        .pipe(
            // take(5),
        )
        .subscribe((data: any) => {
            if (data === null) {
                console.log(JSON.stringify(stats));
                process.exit(0);
                return;
            }
            const contentType = data.value.content.type;
            if (!(isNested(stats[contentType]))) {
                stats[contentType] = {};
            }
            calculateStats(data.value, stats[contentType]);
        });
})();
