/*!
 * @License MIT
 */

import { ContentConstructor } from '../models/post/content.type';

/**
 * Store global metadata for this project
 */
export class MetadataStore {
    public contentTypes: ContentConstructor[] = [];
    public static instance = new MetadataStore();

    /**
     * Private constructor so there con only be one instance
     */
    private constructor() {}
}
