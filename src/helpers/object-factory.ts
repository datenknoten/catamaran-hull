/*!
 * @License MIT
 */

import { Identity } from '../models/identity/identity.model';
import { Content, ContentConstructor } from '../models/post/content.type';

type ObjectFactoryCache = {
    posts: {
        [index: string]: Content | undefined,
    },
    identities: {
        [index: string]: Identity,
    },
};

/**
 * The object cache
 */
export class ObjectFactory {
    public static instance = new ObjectFactory();

    private _cache: ObjectFactoryCache = {
        posts: {},
        identities: {},
    };

    /**
     * Either return or create a post stub
     */
    public getPost(id: string, contentConstructor: ContentConstructor): Content {
        let post = this._cache.posts[id];

        if (typeof post === 'undefined') {
            post = new contentConstructor();
            post.id = id;
            this._cache.posts[id] = post;
        }

        return post;
    }

    /**
     * Just return the enity from the cache
     */
    public findPost(id: string): Content | undefined {
        return this._cache.posts[id];
    }

    /**
     * Either return or create a identity stub
     */
    public getIdentity(id: string): Identity {
        let identity = this._cache.identities[id];
        if (!(identity instanceof Identity)) {
            identity = new Identity(id);
            this._cache.identities[id] = identity;
        }

        return identity;
    }
}
