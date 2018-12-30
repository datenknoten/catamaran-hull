/*!
 * @License MIT
 */

import { Observable, Subject } from 'rxjs';

const pull = require('pull-stream');

/**
 * Convert a pull stream to an observable
 */
export function pullToObserveable(pullStream: unknown): Observable<unknown> {
    const obs = new Subject<unknown>();

    pull(
        pullStream,
        pull.collect((err: string | Error | null, data: Array<unknown>) => {
            if (err !== null) {
                if (err instanceof Error) {
                    obs.next(err);
                } else {
                    obs.next(new Error(err));
                }
            }

            for (const item of data) {
                obs.next(item);
            }
        }),
    );

    return obs;
}
