/*!
 * @License MIT
 */

import { Content, ContentConstructor } from '../models/post/content.type';
import { GatheringAttendee } from '../models/post/gatherings/gathering-attendee.model';
import { GatheringMetadata } from '../models/post/gatherings/gathering-metadata.model';
import { Gathering } from '../models/post/gatherings/gathering.model';
import { IdentityDescription } from '../models/post/identity-description.model';
import { Message } from '../models/post/message.model';
import { Tag } from '../models/post/tag.model';
import { Vote } from '../models/post/vote.model';

import { AbstractClient } from './abstract.client';

/**
 * The cruncher subscribes a live stream on all
 * messages and puts them in sqlite database
 */
export class CruncherClient extends AbstractClient {
    /**
     * Crunch the feed and put it into the database
     */
    public crunch() {
        const feed = this.sbot.createFeedStream({
            live: true,
        });

        pull(
            feed,
            pull.drain((data: unknown) => {
                const content = this.detectContent(data);
            }, (err) => {
                if (err) {
                    throw err;
                }
            }),
        );
    }

    private detectContent(data: unknown): ContentConstructor {
        let postType;
        try {
            const content = data.value.content;
            const contentType = content.type;
            // about is used by either gatherings or identiy description so we have to distinguish them
            if (contentType === 'about') {
                if (typeof content.about === 'string') {
                    if (typeof content.title === 'string') {
                        postType = 'gathering/about';
                    } else if (typeof content.attendee === 'object' && typeof data.value.content.attendee.link === 'string') {
                        postType = 'gathering/attendee';
                    }
                } else {
                    postType = 'identity/about';
                }
            } else {
                postType = contentType;
            }
        } catch (error) {
            console.error('could not determine postType');
            console.dir({ error, data }, { depth: 3  });
        }

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
}
