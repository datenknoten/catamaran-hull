import { PostMessage } from "../models/message/post-message.model";
import { Identity } from "../models/identity/identity.model";

type ObjectFactoryCache = {
    posts: {
        [index: string]: PostMessage
    },
    identities: {
        [index: string]: Identity,
    }
}

export class ObjectFactory {
    private _cache: ObjectFactoryCache = {
        posts: {},
        identities: {}
    }

    public getPost(id: string): PostMessage {
        let post = this._cache.posts[id];
        if (!(post instanceof PostMessage)) {
            post = new PostMessage();
            post.id = id;
            this._cache.posts[id] = post;
        }

        return post;
    }

    public getIdentity(id: string): Identity {
        let identity = this._cache.identities[id];
        if (!(identity instanceof Identity)) {
            identity = new Identity(id);
            this._cache.identities[id] = identity;
        }

        return identity;
    }
}
