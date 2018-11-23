import * as util from 'util';
import { Observable, from } from 'rxjs';

import {
    flatMap,
    map,
    distinct,
} from 'rxjs/operators';

import { PostMessage } from '../models/message/post-message.model';
import { pullToObserveable } from '../helpers/pull-to-observeable';

import { AbstractClient } from "./abstract.client";
import { Identity } from '../models/identity/identity.model';

export class MessageClient extends AbstractClient {
    public fetchPublicFeed(startAt?: Date): Observable<PostMessage> {

        const query = {
            // live: true,
            limit: 10,
            reverse: true,
            query: [{
                $filter: {
                    timestamp: {
                        $lt: (startAt instanceof Date ? +startAt : undefined),
                    },
                    value: {
                        timestamp: {
                            // forces results ordered by published time
                            $gt: 0,
                        },
                        content: {
                            type: 'post',
                        },
                    },
                },
            }],
        };

        return this.parseFeed(this.sbot.query.read(query));
    }

    public fetchIdentityFeed(identy: Identity): Observable<PostMessage> {
        const query = {
            // live: true,
            limit: 10,
            reverse: true,
            query: [{
                $filter: {
                    value: {
                        timestamp: {
                            // forces results ordered by published time
                            $gt: 0,
                        },
                        author: identy.id,
                        content: {
                            type: 'post',
                        },
                    },
                },
            }],
        };

        return this.parseFeed(this.sbot.query.read(query));
    }

    public fetchMentions(identity: Identity): Observable<PostMessage> {
        const backlinks = this.sbot.backlinks.read({
            query: [{ $filter: { dest: identity.id } }],
            index: 'DTA',
        });

        return this.parseFeed(backlinks);
    }

    private parseFeed(feed: any) {
        return pullToObserveable(feed)
            .pipe(
                flatMap((data: any) => {
                    return from(this.parseMessage(data));
                }),
                map((post) => {
                    if (post.root instanceof PostMessage) {
                        return post.root;
                    } else {
                        return post;
                    }
                }),
                distinct(),

                flatMap((post) => {
                    const backlinks = this.sbot.backlinks.read({
                        query: [{ $filter: { dest: post.id } }],
                        index: 'DTA',
                    });

                    return pullToObserveable(backlinks).pipe(
                        flatMap((data: any) =>  {
                            return from(this.parseMessage(data));
                        }),
                        map(() => post)
                    );
                }),
                distinct(),
            );
    }

    private async getPost(id: string) {
        const post = this.factory.getPost(id);

        try {
            const postData = await util.promisify(this.sbot.get)(id);

            return this.parseMessage({
                id,
                value: postData,
            });
        } catch(error) {
            console.warn(`failed to fetch post with id ${id}`);
            return post;
        }
    }

    private async parseMessage(data: any) {
        const post = this.factory.getPost(data.id ? data.id : data.key);
        if (typeof data.timestamp === 'number') {
            post.recievedAt = new Date(data.timestamp);
        }
        post.createdAt = new Date(data.value.timestamp);
        post.author = this.factory.getIdentity(data.value.author);
        await this.client.identity.fetchIdentityDependencies(post.author);
        post.sequence = data.value.sequence;
        post.hash = data.value.hash;
        post.previousMessageId = data.value.previous;
        post.isMissing = false;
        post.channel = data.value.content.channel;
        post.text = data.value.content.text;
        post.raw = data;
        if (typeof data.value.content.root === 'string') {
            post.root = this.factory.getPost(data.value.content.root);
            if (post.root.isMissing === true) {
                await this.getPost(post.root.id);
            }
            if (!post.root.comments.includes(post)) {
                post.root.comments.push(post);
            }
        }
        if (Array.isArray(data.value.content.branch)) {
            post.branches = data.value.content.branch.map((_data: string) => this.factory.getPost(_data));
        }

        return post;
    }
}
