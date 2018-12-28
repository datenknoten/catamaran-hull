import { IdentityImage } from '../models/identity/identity-image.model';
import { IdentityName } from '../models/identity/identity-name.model';
import { Identity } from '../models/identity/identity.model';

import { AbstractClient } from './abstract.client';

export class IdentityClient extends AbstractClient {
    public selfIdentity!: Identity;

    public async init() {
        this.selfIdentity = await this.whoami();
    }

    public async whoami() {
        const whoami = await (new Promise<any>((resolve, reject) => {
            this.sbot.whoami((error: any, data: any) => {
                if (error) {
                    return reject(error);
                }
                resolve(data);
            });
        }));

        if (!(this.selfIdentity instanceof Identity)) {
            this.selfIdentity = this.factory.getIdentity(whoami.id);
            this.selfIdentity.isSelf = true;
        }

        await this.fetchIdentityDependencies(this.selfIdentity);

        return this.selfIdentity;
    }

    public async fetchIdentityDependencies(identity: Identity) {
        await this.fetchPrimaryName(identity);
        await this.fetchPrimaryImage(identity);

        return identity;
    }

    private async fetchPrimaryName(identity: Identity) {
        const name = await new Promise<any>((resolve, _reject) => {
            this.sbot.names.getSignifier(identity.id, (_err: any, _name: any) => {
                resolve(_name);
            });
        });

        const id_name = new IdentityName();
        id_name.name = name;
        id_name.identity = identity;
        id_name.weight = 1;
        identity.primaryName = id_name;

        return identity;
    }

    private async fetchPrimaryImage(identity: Identity) {
        const image = await new Promise<any>((resolve, _reject) => {
            this.sbot.names.getImageFor(identity.id, (_err: any, _image: any) => {
                resolve(_image);
            });
        });

        if (image.startsWith('@')) {
            return identity;
        }

        const id_image = new IdentityImage();
        id_image.blobId = image;
        id_image.identity = identity;
        id_image.weight = 1;

        identity.primaryImage = id_image;

        return identity;
    }
}
