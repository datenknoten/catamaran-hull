import { Observable, from } from 'rxjs';

import {
    flatMap,
    map,
    distinct,
    filter,
} from 'rxjs/operators';

import { PostMessage } from '../models/message/post-message.model';
import { pullToObserveable } from '../helpers/pull-to-observeable';

import { AbstractClient } from "./abstract.client";
import { Identity } from '../models/identity/identity.model';

export type feedType = 'publicFeed' | 'identity' | 'mentions';

export class MessageClient extends AbstractClient {
    private pageStatus = {
        publicFeed: new Date(),
        identity: new Date(),
        mentions: new Date(),
    };

    public fetchPublicFeed(loadMore: boolean = false): Observable<PostMessage> {
        if (loadMore === false) {
            this.pageStatus.publicFeed = new Date();
        }

        const query = {
            // live: true,
            limit: 20,
            reverse: true,
            query: [{
                $filter: {
                    // timestamp: {
                    //     $lt: (startAt instanceof Date ? +startAt : undefined),
                    // },
                    value: {
                        timestamp: {
                            $lt: +this.pageStatus.publicFeed,
                            $gt: 0,
                        },
                        // timestamp: {
                        //     // forces results ordered by published time
                        //     $gt: 0,
                        // },
                        content: {
                            type: 'post',
                        },
                    },
                },
            }],
        };

        return this.parseFeed('publicFeed', this.sbot.query.read(query));
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

        return this.parseFeed('identity', this.sbot.query.read(query));
    }

    public fetchMentions(identity: Identity): Observable<PostMessage> {
        const backlinks = this.sbot.backlinks.read({
            query: [{ $filter: { dest: identity.id } }],
            index: 'DTA',
        });

        return this.parseFeed('mentions', backlinks);
    }

    private parseFeed(name: feedType, feed: any): Observable<PostMessage> {
        return pullToObserveable(feed)
            .pipe(
                flatMap((data: any) => {
                    return from(this.parseMessage(data));
                }),
                map((post) => {
                    const feedPageStatus = this.pageStatus[name];
                    if (
                        (typeof feedPageStatus === 'undefined') ||
                            ((feedPageStatus instanceof Date) &&
                             (feedPageStatus > post.createdAt))
                    ) {
                        this.pageStatus[name] = post.createdAt;
                    }
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
                        filter((data: any) => {
                            return data.value.content.type === 'post'
                        }),
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
            const postData = await (new Promise((resolve, reject) => {
                this.sbot.get(id, (error: any, data: any) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(data);
                });
            }));

            return this.parseMessage({
                id,
                value: postData,
            });
        } catch(error) {
            console.warn(`failed to fetch post with id ${id}`);
            console.warn(error);
            return post;
        }
    }

    private async parseMessage(data: any) {
        const post = this.factory.getPost(data.id ? data.id : data.key);
        if (typeof data.timestamp === 'number') {
            post.recievedAt = new Date(data.timestamp);
        }
        if (data.value === undefined) {
            console.dir(data);
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
        if (typeof post.lastActivity === 'undefined') {
            post.lastActivity = post.createdAt;
        }
        post.raw = data;
        if (typeof data.value.content.root === 'string') {
            post.root = this.factory.getPost(data.value.content.root);
            if (post.root.isMissing === true) {
                await this.getPost(post.root.id);
            }
            if (typeof post.root.lastActivity === 'undefined') {
                post.root.lastActivity = post.createdAt;
            } else if (post.createdAt > post.root.lastActivity) {
                post.root.lastActivity = post.createdAt;
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
