import { Subject } from 'rxjs';

const pull = require('pull-stream');

export function pullToObserveable(pullStream: any): Subject<any> {
    const obs = new Subject();

    pull(
        pullStream,
        pull.drain((data: any) => {
            obs.next(data);
        })
    );

    return obs;
}
