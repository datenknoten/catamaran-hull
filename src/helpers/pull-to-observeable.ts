import { Observable, Subject } from 'rxjs';

const pull = require('pull-stream');

export function pullToObserveable(pullStream: any): Observable<any> {
    const obs = new Subject();

    pull(
        pullStream,
        pull.collect((err: any, data: any) => {
            if (err !== null) {
                obs.next(new Error(err));
            }
            for (const item of data) {
                obs.next(item);
            }
        }),
    );

    return obs;
}
