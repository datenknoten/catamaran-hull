/*!
 * @License MIT
 */

import { DateTime } from 'luxon';
import { from, Observable } from 'rxjs';
import {
    distinct,
    flatMap,
    map,
    tap,
} from 'rxjs/operators';

import { pullToObserveable } from '../helpers/pull-to-observeable';
import { Identity } from '../models/identity/identity.model';
import { Content, ContentConstructor } from '../models/post/content.type';
import { Gathering } from '../models/post/gatherings/gathering.model';
import { Message } from '../models/post/message.model';
import { Post } from '../models/post/post.model';

import { GatheringAttendee } from '../models/post/gatherings/gathering-attendee.model';
import { GatheringMetadata } from '../models/post/gatherings/gathering-metadata.model';
import { IdentityDescription } from '../models/post/identity-description.model';
import { Tag } from '../models/post/tag.model';
import { Vote } from '../models/post/vote.model';

import { AbstractClient } from './abstract.client';

export type feedType = 'publicFeed' | 'identity' | 'mentions';

// tslint:disable-next-line:no-any
type ssbData = any;

/**
 * A client for messages
 */
export class MessageClient extends AbstractClient {
    private pageStatus = {
        publicFeed: new Date(),
        identity: new Date(),
        mentions: new Date(),
    };

    /**
     * Fetch the public feed of the current identity
     */
    public fetchPublicFeed(loadMore: boolean = false): Observable<Content> {
        if (loadMore === false) {
            this.pageStatus.publicFeed = new Date();
        }

        const query = {
            // live: true,
            limit: 50,
            reverse: true,
            query: [{
                $filter: {
                    value: {
                        timestamp: {
                            $lt: +this.pageStatus.publicFeed,
                            $gt: 0,
                        },
                        content: {
                            type: {
                                $in: [
                                    'post',
                                    'gathering',
                                ],
                            },
                        },
                    },
                },
            }],
        };

        return this.parseFeed('publicFeed', this.sbot.query.read(query));
    }

    /**
     * Fetch the feed for the given identity
     */
    public fetchIdentityFeed(identy: Identity): Observable<Content> {
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

    /**
     * Fetch all mentions where you have been mentioned
     */
    public fetchMentions(identity: Identity): Observable<Content> {
        const backlinks = this.sbot.backlinks.read({
            query: [{ $filter: { dest: identity.id } }],
            index: 'DTA',
        });

        return this.parseFeed('mentions', backlinks);
    }

    /**
     * Parse a feed of posts
     */
    private parseFeed(name: feedType, feed: unknown): Observable<Content> {
        return pullToObserveable(feed)
            .pipe(
                flatMap((data: unknown) => {
                    return from(this.parsePost(data));
                }),
                map((post) => {
                    const feedPageStatus = this.pageStatus[name];
                    if (
                        ((feedPageStatus instanceof Date) &&
                         (feedPageStatus > post.createdAt))
                    ) {
                        this.pageStatus[name] = post.createdAt;
                    }
                    if (post.root instanceof Post) {
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
                        // filter((data: ssbData) => data.value.content.type === 'post'),
                        flatMap((data: ssbData) =>  {
                            return from(this.parsePost(data));
                        }),
                        tap((_data: Content) => {
                            // if (data instanceof GatheringMetadata) {
                            //     console.dir({
                            //         tapData: data,
                            //     }, { depth: 1 });
                            // }
                        }),
                        map(() => post),
                    );
                }),
                distinct(),
            );
    }

    /**
     * Retrieve a single post from the database
     */
    private async getPost(id: string) {
        try {
            const postData = await (new Promise((resolve, reject) => {
                this.sbot.get(id, (error: ssbData, data: ssbData) => {
                    if (error !== null) {
                        reject(error);
                        return;
                    }
                    resolve(data);
                });
            }));

            return this.parsePost({
                id,
                value: postData,
            });
        } catch (error) {
            console.warn(`failed to fetch post with id ${id}`);
            console.warn(error);
            return this.factory.getPost(id, Message);
        }
    }

    private getContentType(postType: string): ContentConstructor {
        if (postType === 'post') {
            return Message;
        } else if (postType === 'gathering') {
            return Gathering;
        } else if (postType === 'vote') {
            return Vote;
        } else if (postType === 'gathering/about') {
            return GatheringMetadata;
        } else if (postType === 'gathering/attendee') {
            return GatheringAttendee;
        } else if (postType === 'identity/about') {
            return IdentityDescription;
        } else if (postType === 'tag') {
            return Tag;
        } else {
            throw new Error(`Unknown post type ${postType}`);
        }
    }

    /**
     * Convert ssb data into a content type
     */
    private async parsePost(data: ssbData): Promise<Content> {
        let postType: ContentConstructor = Message;
        try {
            // about is used by either gatherings or identiy description so we have to distinguish them
            if (data.value.content.type === 'about') {
                if (typeof data.value.content.about === 'string') {
                    if (typeof data.value.content.title === 'string') {
                        postType = this.getContentType('gathering/about');
                    } else if (typeof data.value.content.attendee === 'object' && typeof data.value.content.attendee.link === 'string') {
                        postType = this.getContentType('gathering/attendee');
                    }
                } else {
                    postType = this.getContentType('identity/about');
                }
            } else {
                postType = this.getContentType(data.value.content.type);
            }
        } catch (error) {
            console.error('could not determine postType');
            console.dir({ error, data }, { depth: 3  });
        }
        const post = this.factory.getPost(data.id ? data.id : data.key, postType);
        if (typeof data.timestamp === 'number') {
            post.recievedAt = new Date(data.timestamp);
        }
        if (data.value === undefined) {
            console.dir({ xdata: data });
        }
        post.createdAt = new Date(data.value.timestamp);
        post.author = this.factory.getIdentity(data.value.author);
        await this.client.identity.fetchIdentityDependencies(post.author);
        post.sequence = data.value.sequence;
        post.hash = data.value.hash;
        post.previousMessageId = data.value.previous;
        post.isMissing = false;
        post.channel = data.value.content.channel;
        if (post instanceof Message) {
            post.text = data.value.content.text;
        }
        if (post instanceof Vote) {
            const content = data.value.content;
            post.expression = content.vote.expression;
            post.value = content.vote.value;
            await this.getPost(content.vote.link);
            const postTarget = this.factory.findPost(content.vote.link);
            if (typeof postTarget !== 'undefined') {
                post.target = postTarget;
                if (!(postTarget.votes.map(item => item.id).includes(post.id))) {
                    postTarget.votes.push(post);
                }
            }
        }
        if (post instanceof GatheringMetadata) {
            const content = data.value.content;
            post.title = content.title;
            post.content = content.description;

            if (typeof content.startDateTime === 'object') {
                if (typeof content.startDateTime.epoch === 'number') {
                    const startDate = DateTime.fromMillis(content.startDateTime.epoch, {
                        zone: content.startDateTime.tz,
                    });
                    post.startDate = startDate;
                }
            }

            const gathering = this.factory.findPost(content.about);
            if (gathering instanceof Gathering) {
                if (!(gathering.metadata.map(item => item.id).includes(post.id))) {
                    gathering.metadata.push(post);
                }
            }
        }
        if (post instanceof GatheringAttendee) {
            const content = data.value.content;
            post.identity = this.factory.getIdentity(content.attendee.link);
            const gathering = this.factory.findPost(content.about);
            if (gathering instanceof Gathering) {
                if (!(gathering.metadata.map(item => item.id).includes(post.id))) {
                    gathering.attendees.push(post);
                }
            }
        }
        if (typeof post.lastActivity === 'undefined') {
            post.lastActivity = post.createdAt;
        }
        post.raw = data;
        if (typeof data.value.content.root === 'string') {
            await this.getPost(data.value.content.root);
            post.root = this.factory.findPost(data.value.content.root);
            if (typeof post.root !== 'undefined') {
                if (typeof post.root.lastActivity === 'undefined') {
                    post.root.lastActivity = post.createdAt;
                } else if (post.createdAt > post.root.lastActivity) {
                    post.root.lastActivity = post.createdAt;
                }
                if (!post.root.comments.includes(post)) {
                    post.root.comments.push(post);
                }
            }
        }
        if (Array.isArray(data.value.content.branch)) {
            post.branches = data.value.content.branch.map((_data: string) => this.factory.getPost(_data, Message));
        }

        return post;
    }
}
