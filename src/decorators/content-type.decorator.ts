/*!
 * @License MIT
 */

import { MetadataStore } from '../helpers/meta-data';
import { ContentConstructor } from '../models/post/content.type';

/**
 * Decorate content types and register them in the global metadata store
 */
export function ContentType() {
    return function(target: ContentConstructor) {
        MetadataStore.instance.contentTypes.push(target);
    };
}
