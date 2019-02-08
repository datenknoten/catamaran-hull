/*!
 * @License MIT
 */

import {
    plainToClass,
} from 'class-transformer';
import { DateTime } from 'luxon';

import { MetadataStore } from '../helpers/meta-data';
import {
    // Content,
    ContentConstructor,
} from '../models/post/content.type';
import { Post } from '../models/post/post.model';

import { AbstractClient } from './abstract.client';
import { Message } from '../models/post/message.model';

const pull = require('pull-stream');

/**
 * The cruncher subscribes a live stream on all
 * messages and puts them in sqlite database
 */
export class CruncherClient extends AbstractClient {
    /**
     * Crunch the feed and put it into the database
     */
    public async crunch() {
        const start = DateTime.fromJSDate(new Date());
        const queryRunner = this.database.createQueryRunner();
        const feed = this.sbot.createFeedStream({
            live: false,
        });
        const intervalElements = 2000;
        let count = 0;
        let missing = 0;
        let interval = DateTime.fromJSDate(new Date());

        await queryRunner.startTransaction();

        pull(
            feed,
            pull.asyncMap(async (data, cb) => {
                let content;
                try {
                    const contentType = this.detectContent(data);
                    if (typeof contentType === 'undefined') {
                        cb(null, data);
                        return;
                    }
                    content = plainToClass(contentType, data);
                    (content as Post).isMissing = false;
                    const result = await queryRunner.manager.findOne(contentType, content.id);

                    if (typeof result === 'undefined' || (result.isMissing === true)) {
                        if (content instanceof Message && content.root instanceof Message) {
                            await queryRunner.manager.save(content.root);
                        }
                        await queryRunner.manager.save(content);
                        missing++;
                    }

                    const createdAt = ((content) as Post).createdAt;
                    if ((count % intervalElements) === 1) {
                        const rs = Math.ceil(intervalElements / interval.diffNow(['seconds']).seconds*-1);
                        console.dir(`${createdAt.year}-${createdAt.month}-${createdAt.day}: Processed ${count} records (${rs} r/s), missing: ${missing}`);
                        interval = DateTime.fromJSDate(new Date());
                    }
                    count++;
                    // if ((count % 10000) === 1) {
                    //     await queryRunner.commitTransaction();
                    //     // console.dir('Commiting 10000 records');
                    //     await queryRunner.startTransaction();
                    // }
                    cb(null, data);
                } catch(error) {
                    console.dir(data);
                    console.dir(content);
                    console.dir(error);
                    process.exit(1);
                }
            }),
            pull.drain(() => {}, async (err) => {
                const diff = start.diffNow(['minutes', 'seconds']).toObject();
                if (err === null) {
                    await queryRunner.commitTransaction();
                    await this.database.close();
                    console.dir({
                        txt: 'time ellapsed since start',
                        count,
                        diff,
                    });
                    process.exit(0);
                } else if (err !== true) {
                    throw err;
                } else {
                    await queryRunner.commitTransaction();
                    await this.database.close();
                    console.dir({
                        txt: 'time ellapsed since start',
                        count,
                        diff,
                    });
                    process.exit(0);
                }
            }),
        );
    }

    /**
     * Detect the content type of the item
     */
    // tslint:disable-next-line
    private detectContent(data: any): ContentConstructor {
        for (const contentType of MetadataStore.instance.contentTypes) {
            if (contentType.isType(data)) {
                return contentType;
            }
        }
        // let postType;
        // try {
        //     const content = data.value.content;
        //     if (typeof content === 'string') {
        //         postType = 'encrypted';
        //     } else {
        //         const contentType = content.type;
        //         // about is used by either gatherings or identiy description so we have to distinguish them
        //         if (contentType === 'about') {
        //             if (typeof content.about === 'string') {
        //                 if (typeof content.title === 'string') {
        //                     postType = 'gathering/about';
        //                 } else if (
        //                     typeof content.attendee === 'object' &&
        //                         typeof data.value.content.attendee.link === 'string'
        //                 ) {
        //                     postType = 'gathering/attendee';
        //                 } else if (
        //                     typeof content.name === 'string' ||
        //                         typeof content.image === 'string'
        //                 ) {
        //                     postType = 'identity/about';
        //                 }
        //             } else if (typeof content.rating === 'string') {
        //                 postType = 'book/about';
        //             }
        //         } else {
        //             postType = contentType;
        //         }
        //     }

        // } catch (error) {
        //     throw new Error('could not determine postType');
        // }

        // if (postType === 'post') {
        //     return Message;
        // } else if (postType === 'gathering') {
        //     return Gathering;
        // } else if (postType === 'vote') {
        //     return Vote;
        // } else if (postType === 'gathering/about') {
        //     return GatheringMetadata;
        // } else if (postType === 'gathering/attendee') {
        //     return GatheringAttendee;
        // } else if (postType === 'identity/about') {
        //     return IdentityDescription;
        // } else if (postType === 'tag') {
        //     return Tag;
        // } else if (postType === 'bookclub') {
        //     return BookClub;
        // } else if (postType === 'bookclub/description') {
        //     return BookClubDescription;
        // } else if (postType === 'contact') {
        //     return Subscription;
        // } else if (postType === 'encrypted') {
        //     return EncryptedContent;
        // } else if (postType === 'pub') {
        //     return Pub;
        // } else if (postType === 'flag') {
        //     return Flag;
        // } else {
        //     /*console.dir(data);
        //     throw new Error(`Unknown post type ${postType}`);*/
        // }
    }
}
