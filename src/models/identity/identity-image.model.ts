import {
    Identity,
} from './identity.model';

export class IdentityImage {
    public blobId!: string;
    public identity!: Identity;
    public weight!: number;

    public toString() {
        return this.blobId;
    }
}
