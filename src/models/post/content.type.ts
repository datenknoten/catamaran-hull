/*!
 * @License MIT
 */

import { GatheringMetadata } from './gatherings/gathering-metadata.model';
import { Gathering } from './gatherings/gathering.model';
import { Message } from './message.model';
import { Tag } from './tag.model';
import { Vote } from './vote.model';

export type Content = Message | Gathering | Vote | GatheringMetadata | Tag;

export interface ContentConstructor {
    new (): Content;
    isType(data: unknown);
}
